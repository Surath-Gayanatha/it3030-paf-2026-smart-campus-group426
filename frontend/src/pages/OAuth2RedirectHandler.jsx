import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    localStorage.setItem('token', token);

    refreshUser()
      .then((currentUser) => {
        const shouldOnboard = currentUser && currentUser.onboardingCompleted === false;
        navigate(shouldOnboard ? '/onboarding' : '/', { replace: true });
      })
      .catch(() => {
        navigate('/', { replace: true });
      });
  }, [navigate, refreshUser, searchParams]);

  return <div className="route-loading">Signing you in...</div>;
};

export default OAuth2RedirectHandler;
