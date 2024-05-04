import React, { useState } from 'react';

function CustomDialog() {
    const [isOpen, setIsOpen] = useState(false);

    const openDialog = () => {
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    
    return (
        <div>
            
        </div>
    )

}
