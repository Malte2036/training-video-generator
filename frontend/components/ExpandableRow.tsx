import { Collapse, IconButton, TableCell, TableRow } from '@mui/material';
import { useState } from 'react';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

export default function ExpandableRow(props: {
	tableCells: JSX.Element[];
	children: JSX.Element;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<TableRow>
				<TableCell>
					<IconButton
						aria-label="expand row"
						size="small"
						onClick={() => setOpen(!open)}
					>
						{open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
					</IconButton>
				</TableCell>
				{props.tableCells}
			</TableRow>
			<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
				<Collapse in={open} timeout="auto" unmountOnExit>
					{props.children}
				</Collapse>
			</TableCell>
		</>
	);
}
