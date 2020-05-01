import React from 'react';
import { makeStyles, Badge, Avatar, IconButton } from '@material-ui/core';
import { AddCircleTwoTone } from '@material-ui/icons'
import token from '../js/token.js';

const useStyles = makeStyles(theme => ({
	profilePic: {
		display: 'inline-flex',
		minWidth: '90px',
		minHeight: '90px',
		[theme.breakpoints.up('sm')]: {
			width: '180px',
			height: '180px'
		}
	}
}));

function ProfileUpload(props) {
	const styles = useStyles();

	async function handleUploadProfile(e) {
		const data = new FormData();
		data.append('file', e.target.files[0]);

		const picture = await fetch(`http://localhost:3001/user/0/picture`,
			{
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				body: data
			})
			.then(() => fetch(`http://localhost:3001/user/0/picture`,
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token.get()}`
					}
				}))
			.then(res => res.blob());

		props.update(URL.createObjectURL(picture));
	}

	return (
		<Badge
			overlap="circle"
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			badgeContent={
				<div>
					<input id="upload-profile-pic" accept="image/*" type="file" style={{ display: 'none' }} onChange={handleUploadProfile} />
					<IconButton component="label" htmlFor="upload-profile-pic">
						<AddCircleTwoTone fontSize="large"></AddCircleTwoTone>
					</IconButton>
				</div>
			}
			style={{ marginRight: '10px' }}
		>
			<Avatar className={styles.profilePic} src={props.picturesrc} />
		</Badge>
	);
}

export default ProfileUpload;