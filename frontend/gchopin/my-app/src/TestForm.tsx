import React, {FormEvent, ChangeEvent} from 'react';

type Props = {}

type State = {
	value: string,
}

class Form extends React.Component<Props, State> {
	state = {value: ''};

	onChange = (e: ChangeEvent<HTMLInputElement>): void => {
		this.setState({value: e.target.value});
	};
	onSubmit = (e: FormEvent<HTMLFormElement>): void => {
		console.log(this.state.value);
		e.preventDefault();
	};
	render() {
		return (
			<form onSubmit={this.onSubmit}>
				<label>value</label>
				<input type="text" value={this.state.value} onChange={this.onChange} />
				<input type="submit" value="Envoyer" />
			</form>
		);
	}
}

export default Form;
