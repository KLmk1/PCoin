import { Link } from "react-router-dom";

const Error = () => {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-4xl font-bold text-center"><Link to="/PCoin/">Eror 404! Страница не найдена.</Link></h2>
        <p className="mt-2 text-lg"><Link to="/PCoin/">Перейти на главную страницу</Link></p>
      </div>
    );  
  };
  
  export default Error;