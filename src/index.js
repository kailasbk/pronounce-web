import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import * as serviceWorker from './js/serviceWorker';
import token from './js/token.js'

import Home from './pages/Home';
import About from './pages/About';
import Account from './pages/Account';
import Invite from './pages/Invite';
import Error from './pages/Error';
import Group from './pages/Group';
import Register from './pages/Register';
import Login from './pages/Login';

import Navbar from './components/Navbar';
import { Container, CssBaseline } from '@material-ui/core';
import { unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core/styles'

const theme = createMuiTheme({});

function App() {
	function ProtectedRoutes(props) {
		if (token.get() === '') {
			console.log('Not logged in. Redirecting...');
			return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
		}
		else {
			return (
				<Route>
					<Switch>
						<Route path="/" component={Home} exact />
						<Route path="/account" component={Account} />
						<Route path="/invite" component={Invite} />
						<Route path="/group/:id?" component={Group} />
						<Route component={Error} />
					</Switch>
				</Route>
			);
		}
	}

	return (
		<div className="container" style={{ minHeight: '100vh' }}>
			<Router>
				<Navbar />
				<Container maxWidth="md" className="content" style={{ padding: '16px' }}>
					<Switch>
						<Route path="/register" component={Register} />
						<Route path="/login" component={Login} />
						<Route path="/about" component={About} />
						<ProtectedRoutes />
					</Switch>
				</Container>
			</Router>
		</div>
	)
}

ReactDOM.render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</React.StrictMode >,
	document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
