import React, { Suspense } from 'react';

const Icon = ({ id, alt = "Icon", className = "", color = "#000000" }) => {
    try {
        const IconComponent = React.lazy(() => import(`../../assets/categories/cat-${id}.svg`));

        return (
            <Suspense fallback={<span>Loading...</span>}>
                <IconComponent
                    alt={alt}
                    className={className}
                    style={{ color }}
                />
            </Suspense>
        );
    } catch (error) {
        console.error(`Error loading icon with id: ${id}`, error);
        return <span className="icon-error">Icon not found</span>;
    }
};

export default Icon;