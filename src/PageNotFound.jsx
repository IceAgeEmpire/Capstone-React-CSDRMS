import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export default function PageNotFound() {
    const [counter, setCounter] = useState(5);
    const navigate = useNavigate();

    useEffect(() => {
        if (counter <= 0) {
            navigate("/");
            return;
        }
        const timer = setTimeout(() => {
            setCounter(counter - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [counter, navigate]);
    return (
    <>
        <div className='error-page'>
            <h1>404</h1>
            <p>The page you are looking for does not exist.</p>
                <section className='counter'>
                Redirecting in {counter} seconds...
                </section>
        </div>
    </>
    );
}
