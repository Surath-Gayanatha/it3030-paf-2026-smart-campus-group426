import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const redirectTo = sessionStorage.getItem('postLoginRedirect') || '/';

    const resolveRedirect = (currentUser) => {
      if (currentUser?.role === 'ADMIN') {
        return '/facilities/create';
      }

      if (redirectTo === '/facilities/create') {
        return '/admin-login';
      }

      if (currentUser?.onboardingCompleted === false) {
        return '/onboarding';
      }

      return redirectTo;
    };

    sessionStorage.removeItem('postLoginRedirect');

    if (!token) {
      navigate(resolveRedirect(), { replace: true });
      return;
    }

    localStorage.setItem('token', token);

    refreshUser()
      .then((currentUser) => {
        navigate(resolveRedirect(currentUser), { replace: true });
      })
      .catch(() => {
        navigate(resolveRedirect(), { replace: true });
      });
  }, [navigate, refreshUser, searchParams]);

  return <div className="route-loading">Signing you in...</div>;
};

export default OAuth2RedirectHandler;
