import { HttpClient } from '@angular/common/http';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { defer, Observable, of, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPollutionType } from '../pollution-type';
import { PollutionReport } from '../pollution-recap/pollution-recap';

export interface Pollution extends PollutionReport {
	id: number | string;
}

export type PollutionStorageMode = 'api' | 'local';

export const POLLUTION_STORAGE_MODE = new InjectionToken<PollutionStorageMode>(
	'POLLUTION_STORAGE_MODE',
	{ providedIn: 'root', factory: () => environment.pollutionStorage },
);

const LOCAL_STORAGE_KEY = 'pollution-reports';
const API_REQUEST_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class PollutionService {
	private readonly http = inject(HttpClient);
	private readonly storageMode = inject(POLLUTION_STORAGE_MODE);
	private readonly pollutionsUrl = `${environment.apiUrl}/pollutions`;

	get usesLocalStorage(): boolean {
		return this.storageMode === 'local';
	}

	getAll(): Observable<Pollution[]> {
		if (this.usesLocalStorage) {
			return defer(() => of(this.readLocalPollutions()));
		}

		return this.withApiTimeout(this.http.get<Pollution[]>(this.pollutionsUrl));
	}

	getById(id: number | string): Observable<Pollution> {
		if (this.usesLocalStorage) {
			return defer(() => {
				const pollution = this.readLocalPollutions()
					.find((item) => String(item.id) === String(id));
				if (!pollution) {
					throw new Error(`Pollution introuvable : ${id}`);
				}
				return of(pollution);
			});
		}

		return this.withApiTimeout(
			this.http.get<Pollution>(`${this.pollutionsUrl}/${encodeURIComponent(id)}`),
		);
	}

	create(pollution: PollutionReport): Observable<Pollution> {
		if (this.usesLocalStorage) {
			return defer(() => {
				const pollutions = this.readLocalPollutions();
				const nextId = pollutions.reduce((maxId, item) => {
					const id = typeof item.id === 'number' ? item.id : Number(item.id);
					return Number.isInteger(id) ? Math.max(maxId, id) : maxId;
				}, 0) + 1;
				const created: Pollution = { ...pollution, id: nextId };
				this.writeLocalPollutions([...pollutions, created]);
				return of(created);
			});
		}

		return this.withApiTimeout(this.http.post<Pollution>(this.pollutionsUrl, pollution));
	}

	update(id: number | string, pollution: PollutionReport): Observable<Pollution> {
		if (this.usesLocalStorage) {
			return defer(() => {
				const pollutions = this.readLocalPollutions();
				const index = pollutions.findIndex((item) => String(item.id) === String(id));
				if (index === -1) {
					throw new Error(`Pollution introuvable : ${id}`);
				}

				const updated: Pollution = { ...pollution, id: pollutions[index].id };
				pollutions[index] = updated;
				this.writeLocalPollutions(pollutions);
				return of(updated);
			});
		}

		return this.withApiTimeout(
			this.http.put<Pollution>(
				`${this.pollutionsUrl}/${encodeURIComponent(id)}`,
				pollution,
			),
		);
	}

	delete(id: number | string): Observable<void> {
		if (this.usesLocalStorage) {
			return defer(() => {
				const pollutions = this.readLocalPollutions();
				const remaining = pollutions.filter((item) => String(item.id) !== String(id));
				if (remaining.length === pollutions.length) {
					throw new Error(`Pollution introuvable : ${id}`);
				}

				this.writeLocalPollutions(remaining);
				return of(undefined);
			});
		}

		return this.withApiTimeout(
			this.http.delete<void>(`${this.pollutionsUrl}/${encodeURIComponent(id)}`),
		);
	}

	private withApiTimeout<T>(request: Observable<T>): Observable<T> {
		return request.pipe(timeout({ first: API_REQUEST_TIMEOUT_MS }));
	}

	private readLocalPollutions(): Pollution[] {
		const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (stored === null) {
			return [];
		}

		const pollutions: unknown = JSON.parse(stored);
		if (!Array.isArray(pollutions) || !pollutions.every(isPollution)) {
			throw new Error('Les pollutions enregistrées localement sont invalides.');
		}

		return pollutions;
	}

	private writeLocalPollutions(pollutions: Pollution[]): void {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pollutions));
	}
}

function isPollution(value: unknown): value is Pollution {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const pollution = value as Record<string, unknown>;
	return (
		(typeof pollution['id'] === 'number' || typeof pollution['id'] === 'string') &&
		typeof pollution['title'] === 'string' &&
		isPollutionType(pollution['type']) &&
		typeof pollution['description'] === 'string' &&
		typeof pollution['observedAt'] === 'string' &&
		typeof pollution['location'] === 'string' &&
		typeof pollution['latitude'] === 'number' &&
		typeof pollution['longitude'] === 'number' &&
		typeof pollution['photoUrl'] === 'string'
	);
}
