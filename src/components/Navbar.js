import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Container, Button, IconButton, Typography, makeStyles } from '@material-ui/core';
import { InfoOutlined, HomeOutlined, AccountCircleOutlined, AddOutlined } from '@material-ui/icons'

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

	return (
		<AppBar position="static">
			<Container maxWidth='md'>
				<Toolbar disableGutters>
					<Link to="/">
						<Button className={styles.title}>
							<Typography variant="h5">
								Pronounce.IO
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
						<Link to="/invite">
							<IconButton style={{ color: "#ffffff", fontSize: '2rem' }}>
								<AddOutlined fontSize="inherit" color="inherit" />
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
		</AppBar>
	)
}

