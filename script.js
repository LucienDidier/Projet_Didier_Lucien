const form = document.querySelector('#registration-form');
const formMessage = document.querySelector('#form-message');
const summary = document.querySelector('#summary');
const summaryList = document.querySelector('#summary-list');
const editButton = document.querySelector('#edit-button');

const fields = [
	{ id: 'login', label: 'Login' },
	{ id: 'password', label: 'Mot de passe' },
	{ id: 'password-confirmation', label: 'Confirmation du mot de passe' },
	{ id: 'last-name', label: 'Nom' },
	{ id: 'first-name', label: 'Pr\u00e9nom' },
	{ id: 'address', label: 'Adresse' },
	{ id: 'email', label: 'Email' },
	{ id: 'phone', label: 'T\u00e9l\u00e9phone' },
	{ id: 'birth-date', label: 'Date de naissance' }
];

const displayLabels = {
	login: 'Login',
	email: 'Email',
	'last-name': 'Nom',
	'first-name': 'Pr\u00e9nom',
	address: 'Adresse',
	phone: 'T\u00e9l\u00e9phone',
	'birth-date': 'Date de naissance'
};

function showError(message, invalidIds = []) {
	formMessage.textContent = message;
	document.querySelectorAll('input').forEach((input) => {
		input.classList.toggle('invalid', invalidIds.includes(input.id));
	});
}

function clearError() {
	formMessage.textContent = '';
	document.querySelectorAll('input').forEach((input) => input.classList.remove('invalid'));
}

function createSummary(data) {
	summaryList.replaceChildren();

	Object.entries(displayLabels).forEach(([id, label]) => {
		const row = document.createElement('div');
		const term = document.createElement('dt');
		const description = document.createElement('dd');
		term.textContent = label;
		description.textContent = data.get(id);
		row.append(term, description);
		summaryList.append(row);
	});
}

form.addEventListener('submit', (event) => {
	event.preventDefault();
	clearError();

	const data = new FormData(form);
	const emptyField = fields.find(({ id }) => !String(data.get(id)).trim());

	if (emptyField) {
		showError(`Le champ \u00ab ${emptyField.label} \u00bb est obligatoire.`, [emptyField.id]);
		document.querySelector(`#${emptyField.id}`).focus();
		return;
	}

	const email = document.querySelector('#email');
	if (!email.validity.valid) {
		showError('Veuillez saisir une adresse email valide.', ['email']);
		email.focus();
		return;
	}

	if (data.get('password') !== data.get('password-confirmation')) {
		showError('Le mot de passe et sa confirmation doivent \u00eatre identiques.', ['password', 'password-confirmation']);
		document.querySelector('#password-confirmation').focus();
		return;
	}

	createSummary(data);
	form.hidden = true;
	summary.hidden = false;
});

editButton.addEventListener('click', () => {
	summary.hidden = true;
	form.hidden = false;
	document.querySelector('#login').focus();
});
