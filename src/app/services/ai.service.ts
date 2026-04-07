import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private baseUrl = 'http://localhost:8080/AIEducanet/';

  constructor(private zone: NgZone) { }

  getAIStatisticsStream(userId: number, prompt: string, mode: 'insights' | 'chat' = 'insights'): Observable<string> {
    return new Observable<string>(observer => {
      const controller = new AbortController();

      fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prompt, mode }),
        signal: controller.signal
      })
        .then(async response => {
          if (!response.body) throw new Error('Streaming not supported');
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            let boundary = buffer.indexOf('\n\n');
            while (boundary !== -1) {
              const chunk = buffer.slice(0, boundary);
              buffer = buffer.slice(boundary + 2);
              
              const lines = chunk.split('\n');
              for (const line of lines) {
                if (line.startsWith('data:')) {
                  // On récupère exactement ce qui suit "data:" sans faire de trim() ou de suppression d'espace.
                  // Ainsi, si l'IA génère " de" (avec espace), il sera conservé lors de l'assemblage.
                  const data = line.substring(5); 
                  if (data) {
                     this.zone.run(() => observer.next(data));
                  }
                }
              }
              boundary = buffer.indexOf('\n\n');
            }
          }
          this.zone.run(() => observer.complete());
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            this.zone.run(() => observer.error(err));
          }
        });

      return () => {
        controller.abort();
      };
    });
  }
}
