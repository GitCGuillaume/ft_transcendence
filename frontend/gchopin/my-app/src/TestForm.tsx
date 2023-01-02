import React, {FormEvent, ChangeEvent} from 'react';

type Props = {}

type State = {
	name: string,
	age: number,
	breed: string,
	text: string
}

export default class Form extends React.Component<Props, State> {
	constructor(props: any) {
		super(props);
		this.state = {name: '', age: 0,
			breed: '', text: ''};
		this.onChange = this.onChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
	}
	onChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const name = e.currentTarget.name;// as string;
		const value = e.currentTarget.value;// as string;
		this.setState((prevState => (
			{ ...prevState, [name]: value }
		)));
	};
	onSubmit = (e: FormEvent<HTMLFormElement>): void => {
		console.log(this.state.name + " " + this.state.age + " " + this.state.breed);
		e.preventDefault();
		const res:any = fetch('http://localhost:8080/cats', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				name: this.state.name,
				age: this.state.age,
				breed: this.state.breed,
			})
		}).then(res => res.text())//.text pour test brut, json pour display objet json
		.then(res => {
			this.setState({
				text: res
			});
			console.log(res);

		}).catch(err => {
			console.log(err);
		});
		if (!res.ok)
			console.log('res is a Promise so async, error !res.ok');
	};
	render() {
		const text: string = this.state.text;
		return (
			<section>
			<article>
			<form onSubmit={this.onSubmit}>
				<label>value</label>
				<input type="text" name="name" value={this.state.name} onChange={this.onChange} />
				<input type="text" name="age" value={this.state.age} onChange={this.onChange} />
				<input type="text" name="breed" value={this.state.breed} onChange={this.onChange} />
				<input type="submit" value="Envoyer" />
			</form>
			</article>
			<p>{text}</p>
			</section>
		);
	}
}
