const Icon = ({id, alt="Icon", className=""}) => {
    try {
        const iconSrc = require(`../../assets/categories/cat-${id}.svg`);

        return (
            <img
            src={iconSrc}
            alt={alt}
            className={className}
            // style={}
            />
        );
    } catch (error) {
        console.error(`Error oading icon with id: ${id}`, error);
        return <span className="icon-error">Icon not found</span>
    }
};

export default Icon;