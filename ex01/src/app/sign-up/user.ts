export interface User {
	id: number;
	name: string;
	email: string;
}

export interface CreateUserRequest {
	name: string;
	email: string;
	password: string;
}

export interface CreatedUser extends User {
	message?: string;
}
