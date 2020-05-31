import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Container, Button, IconButton, Typography, makeStyles } from '@material-ui/core';
import { InfoOutlined, HomeOutlined, AccountCircleOutlined, PeopleAltOutlined, MailOutline } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
	navbarSpacer: {
		flexGrow: 1
	},
	title: {
		color: '#ffffff',
		textTransform: 'none',
		padding: '0'
	},
	iconButtons: {
		display: 'inline-block',
		[theme.breakpoints.down('xs')]: {
			display: 'none'
		}
	}
}));

export default function Navbar() {
	const styles = useStyles();

	function Dot() {
		return <span style={{ display: 'inline-block', height: '4px', width: '4px', borderRadius: '2px', border: '2px solid white', margin: '2px' }}> </span>;
	}

	return (
		<AppBar position="static">
			<Container maxWidth='md'>
				<Toolbar disableGutters>
					<Link to="/">
						<Button className={styles.title}>
							<Typography variant="h5" style={{ display: 'flex', alignItems: 'center', textDecoration: 'underline', textDecorationColor: '#ffffff' }}>
								pro <Dot /> noun <Dot /> cit
							</Typography>
						</Button>
					</Link>
					<div className={styles.navbarSpacer} />
					<div className={styles.iconButtons}>
						<Link to="/">
							<IconButton style={{ color: "#ffffff", fontSize: '2rem' }}>
								<HomeOutlined fontSize="inherit" color="inherit" />
							</IconButton>
						</Link>
						<Link to="/group">
							<IconButton style={{ color: "#ffffff", fontSize: '2rem' }}>
								<PeopleAltOutlined fontSize="inherit" color="inherit" />
							</IconButton>
						</Link>
						<Link to="/inbox">
							<IconButton style={{ color: "#ffffff", fontSize: '2rem' }}>
								<MailOutline fontSize="inherit" color="inherit" />
							</IconButton>
						</Link>
						<Link to="/account">
							<IconButton style={{ color: "#ffffff", fontSize: '2rem' }}>
								<AccountCircleOutlined fontSize="inherit" color="inherit" />
							</IconButton>
						</Link>
						<Link to="/about">
							<IconButton style={{ color: "#ffffff", fontSize: '2rem' }}>
								<InfoOutlined fontSize="inherit" color="inherit" />
							</IconButton>
						</Link>
					</div>
				</Toolbar>
			</Container>
		</AppBar >
	)
}

