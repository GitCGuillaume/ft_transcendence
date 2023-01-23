import React from 'react';

type Props = {
    children: JSX.Element
}

type Error = {
    hasError: boolean
}

export default class ErrorBoundary extends React.Component<Props, Error> {
    constructor(props: any) {
        super(props);
        this.state = {
            hasError: false
        }
    }
    static getDerivedStateFromError(error: any)
    {
        return {
            hasError: true, error
        };
    }
    componentDidCatch = (error: any, errorInfo: any) => {
        console.log(error);
        console.log(errorInfo);
    }
    render(): JSX.Element {
        if (this.state.hasError)
            return (<p>An error happened</p>);
        return (this.props.children);
    }
}