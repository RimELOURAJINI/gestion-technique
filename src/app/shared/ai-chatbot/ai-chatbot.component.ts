import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.component.html',
  styleUrl: './ai-chatbot.component.css'
})
export class AiChatbotComponent implements OnInit, OnDestroy {

  // ── État du panneau ───────────────────────────────────────────────
  isOpen: boolean = false;
  showPulse: boolean = true;

  // ── Données utilisateur ───────────────────────────────────────────
  userId: number | null = null;
  userRole: string = 'UNKNOWN';

  // ── Messages ──────────────────────────────────────────────────────
  messages: ChatMessage[] = [];
  inputText: string = '';
  isStreaming: boolean = false;

  // ── Stream control ────────────────────────────────────────────────
  private abortController: AbortController | null = null;

  // ── Refs DOM ──────────────────────────────────────────────────────
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef;

  private readonly API_URL = 'http://localhost:8080/AIEducanet/';
  private readonly LOG = '[AI-CHATBOT]';
  private sseBuffer = '';

  constructor(
    private authService: AuthService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    this.userRole = this.authService.currentUserValue?.roles?.[0] ?? 'UNKNOWN';

    // Message de bienvenue
    this.messages.push({
      role: 'ai',
      text: `👋 Bonjour ! Je suis **AI Educanet**, votre agent d'aide à la décision.\n\nPosez-moi vos questions sur vos projets, tâches, équipes ou budgets. Je dispose de toutes vos données en temps réel.`,
      timestamp: new Date()
    });

    // Retire le badge pulsant après 5 secondes
    setTimeout(() => { this.showPulse = false; }, 5000);
  }

  ngOnDestroy(): void {
    this.cancelStream();
  }

  // ── Toggle panneau ────────────────────────────────────────────────
  toggleChatbot(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      console.log(`${this.LOG} 🚀 Ouverture du chatbot - userId: ${this.userId} - rôle: ${this.userRole}`);
      this.showPulse = false;
      setTimeout(() => this.scrollToBottom(), 100);
      setTimeout(() => this.chatInput?.nativeElement?.focus(), 200);
    }
  }

  closeChatbot(): void {
    this.isOpen = false;
  }

  // ── Envoi d'un message ────────────────────────────────────────────
  async sendMessage(): Promise<void> {
    const prompt = this.inputText.trim();
    if (!prompt || this.isStreaming) return;
    if (!this.userId) {
      console.error(`${this.LOG} ❌ userId non disponible — utilisateur non connecté ?`);
      return;
    }

    console.log(`${this.LOG} 🚀 Envoi question    - userId: ${this.userId} - mode: chat`);
    console.log(`${this.LOG} 📤 Prompt envoyé: "${prompt}"`);

    // Ajouter message user
    this.messages.push({ role: 'user', text: prompt, timestamp: new Date() });

    // Ajouter placeholder IA
    const aiMsgIndex = this.messages.length;
    this.messages.push({ role: 'ai', text: '', timestamp: new Date() });

    // Reset input + activer streaming
    this.inputText = '';
    this.isStreaming = true;
    this.cdr.detectChanges();
    this.scrollToBottom();

    // Stream fetch
    this.abortController = new AbortController();

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authService.getToken() ?? ''}`
        },
        body: JSON.stringify({ userId: this.userId, prompt, mode: 'chat' }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} — ${response.statusText}`);
      }
      if (!response.body) {
        throw new Error('ReadableStream non supporté par ce navigateur');
      }

      console.log(`[AI-STREAM] 🔗 Connexion SSE établie`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      this.sseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        this.consumeSseChunk(chunk, aiMsgIndex);
      }

      this.flushSseBuffer(aiMsgIndex);
      console.log(`[AI-STREAM] ✅ Stream terminé`);
      console.log(`${this.LOG} ✅ Stream terminé - réponse complète reçue`);

    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log(`${this.LOG} ⚠️ Stream annulé par l'utilisateur`);
        this.zone.run(() => {
          this.messages[aiMsgIndex].text += ' _(réponse interrompue)_';
        });
      } else {
        console.error(`[AI-STREAM] ❌ Erreur: ${err?.message || err}`);
        console.error(`${this.LOG} ❌ Erreur stream: ${err?.message || err}`);
        this.zone.run(() => {
          this.messages[aiMsgIndex].text = `❌ Une erreur est survenue : ${err?.message || 'Impossible de contacter le serveur.'}`;
        });
      }
    } finally {
      this.zone.run(() => {
        this.isStreaming = false;
        this.abortController = null;
        this.cdr.detectChanges();
        this.scrollToBottom();
        setTimeout(() => this.chatInput?.nativeElement?.focus(), 100);
      });
    }
  }

  private consumeSseChunk(rawChunk: string, aiMsgIndex: number): void {
    this.sseBuffer += rawChunk;
    const events = this.sseBuffer.split('\n\n');
    this.sseBuffer = events.pop() ?? '';

    for (const eventBlock of events) {
      const eventText = this.extractSseEventText(eventBlock);
      if (!eventText) continue;

      console.log(`[AI-STREAM] 📥 Chunk reçu: "${eventText}"`);
      this.zone.run(() => {
        this.messages[aiMsgIndex].text += eventText;
        this.cdr.detectChanges();
        this.scrollToBottom();
      });
    }
  }

  private flushSseBuffer(aiMsgIndex: number): void {
    const pending = this.extractSseEventText(this.sseBuffer);
    this.sseBuffer = '';
    if (!pending) return;

    console.log(`[AI-STREAM] 📥 Chunk reçu: "${pending}"`);
    this.zone.run(() => {
      this.messages[aiMsgIndex].text += pending;
      this.cdr.detectChanges();
      this.scrollToBottom();
    });
  }

  private extractSseEventText(eventBlock: string): string {
    return eventBlock
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.substring(5))
      .join('');
  }

  // ── Envoi par touche Entrée ───────────────────────────────────────
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // ── Annulation stream en cours ────────────────────────────────────
  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // ── Scroll automatique vers le bas ────────────────────────────────
  private scrollToBottom(): void {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch (_) {}
  }

  // ── Formatage léger du texte IA (markdown simplifié) ──────────────
  formatText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  // ── Vider la conversation ─────────────────────────────────────────
  clearMessages(): void {
    this.messages = [{
      role: 'ai',
      text: `👋 Conversation réinitialisée. Comment puis-je vous aider ?`,
      timestamp: new Date()
    }];
  }
}
