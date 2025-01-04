import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

const Error = ({ message, type }) => {

    switch (type) {
        case 'error':
            return (
                <Alert color="failure" icon={HiInformationCircle} className="mt-4">
                    {message}
                </Alert>
            );
        case 'alert':
            return (
                <Alert color="warning" icon={HiInformationCircle} className="mt-4">
                    {message}
                </Alert>
            );
        case 'info':
            return (
                <Alert color="success" icon={HiInformationCircle} className="mt-4">
                    {message}
                </Alert>
            );
        default:
            break;
    }

}

export default Error;