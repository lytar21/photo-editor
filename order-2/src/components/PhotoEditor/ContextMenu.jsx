import React from "react";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

const ContextMenu = ({ onClose, onDelete, isOpen, position }) => {
    const handleClose = () => {
        onClose();
    };

    const handleDelete = () => {
        onDelete();
        onClose();
    };

    return (
        <Menu
            id="context-menu"
            anchorReference="anchorPosition"
            anchorPosition = {{top: position.y, left: position.x}}
            open={isOpen}
            onClose={handleClose}
        >
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
    );
};

export default ContextMenu;
