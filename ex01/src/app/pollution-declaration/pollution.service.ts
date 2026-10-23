import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PollutionReport } from '../pollution-recap/pollution-recap';

export interface Pollution extends PollutionReport {
	id: number | string;
}

@Injectable({ providedIn: 'root' })
export class PollutionService {
	private readonly http = inject(HttpClient);
	private readonly pollutionsUrl = `${environment.apiUrl}/pollutions`;

	getAll(): Observable<Pollution[]> {
		return this.http.get<Pollution[]>(this.pollutionsUrl);
	}

	getById(id: number | string): Observable<Pollution> {
		return this.http.get<Pollution>(`${this.pollutionsUrl}/${encodeURIComponent(id)}`);
	}

	create(pollution: PollutionReport): Observable<Pollution> {
		return this.http.post<Pollution>(this.pollutionsUrl, pollution);
	}

	update(id: number | string, pollution: PollutionReport): Observable<Pollution> {
		return this.http.put<Pollution>(
			`${this.pollutionsUrl}/${encodeURIComponent(id)}`,
			pollution,
		);
	}

	delete(id: number | string): Observable<void> {
		return this.http.delete<void>(`${this.pollutionsUrl}/${encodeURIComponent(id)}`);
	}
}
