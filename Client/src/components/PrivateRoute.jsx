import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);

  // ⏳ Wait until user is loaded
  if (currentUser === undefined) {
    return (
      <div className="text-center mt-10 text-lg">
        Loading...
      </div>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/sign-in" />;
}
