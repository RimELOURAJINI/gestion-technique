import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HrService {
  private attendanceUrl = 'http://localhost:8080/api/attendance';
  private leavesUrl = 'http://localhost:8080/api/leaves';

  constructor(private http: HttpClient) { }

  // Attendance
  getMyAttendance(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.attendanceUrl}/user/${userId}`);
  }

  getAttendanceByUserId(userId: number): Observable<any[]> {
    return this.getMyAttendance(userId);
  }

  getTodayAttendance(userId: number): Observable<any> {
    return this.http.get<any>(`${this.attendanceUrl}/user/${userId}/today`);
  }

  getTeamAttendance(managerId: number, date: Date): Observable<any[]> {
    return this.http.get<any[]>(`${this.attendanceUrl}/manager/${managerId}/date?timestamp=${date.getTime()}`);
  }

  getTeamAttendanceHistory(managerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.attendanceUrl}/manager/${managerId}/history`);
  }

  getAllAttendanceByDate(date: Date): Observable<any[]> {
    return this.http.get<any[]>(`${this.attendanceUrl}/admin/date?timestamp=${date.getTime()}`);
  }

  checkIn(userId: number): Observable<any> {
    return this.http.post(`${this.attendanceUrl}/user/${userId}/check-in`, {});
  }

  checkOut(userId: number, attendanceId: number): Observable<any> {
    return this.http.patch(`${this.attendanceUrl}/user/${userId}/check-out?attendanceId=${attendanceId}`, {});
  }

  // Leaves
  getMyLeaves(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.leavesUrl}/user/${userId}`);
  }

  getTeamLeaves(managerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.leavesUrl}/manager/${managerId}`);
  }

  getPendingTeamLeaves(managerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.leavesUrl}/manager/${managerId}/pending`);
  }

  requestLeave(userId: number, request: any): Observable<any> {
    return this.http.post(`${this.leavesUrl}/user/${userId}/request`, request);
  }

  processLeave(leaveId: number, managerId: number, status: string, feedback: string = ''): Observable<any> {
    return this.http.patch(`${this.leavesUrl}/${leaveId}/process?status=${status}&managerId=${managerId}&feedback=${feedback}`, {});
  }
}
