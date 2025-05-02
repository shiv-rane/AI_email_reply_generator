import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import styled from 'styled-components';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        throw new Error('Invalid Credentials');
      }
  
      // ✅ Try to parse as JSON, else treat as text
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json(); // Proper JSON response
      } else {
        data = { token: await response.text() }; // Raw token as string
      }
  
      localStorage.setItem('token', data.token); // Store token
      console.log('Login successful, Token:', data.token);
      navigate('/'); // Redirect to homepage
  
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <BrandSection>
        <BrandContent>
          <BrandHeading>Transform Your Email Outreach</BrandHeading>
          <BrandSubtext>
            Elevate your communication with AI-powered personalization, smart follow-ups,
            and real-time analytics for impactful campaigns.
          </BrandSubtext>
        </BrandContent>
      </BrandSection>

      <LoginSection>
        <LoginForm>
          <FormTitle>Welcome Back</FormTitle>
          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <Label>Email Address</Label>
              <InputField
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <InputField
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <LoginButton type="submit">Sign In</LoginButton>

            <RegistrationPrompt>
              New user? <RegisterLink href="/register">Register here</RegisterLink>
            </RegistrationPrompt>
          </Form>
        </LoginForm>
      </LoginSection>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const BrandSection = styled.div`
  flex: 1;
  background: #1a1d23;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const BrandContent = styled.div`
  max-width: 480px;
  margin: 0 auto;
`;

const BrandHeading = styled.h1`
  color: #fff;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`;

const BrandSubtext = styled.p`
  color: #a0aec0;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const LoginSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
`;

const LoginForm = styled.div`
  width: 380px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #1a202c;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

const RegistrationPrompt = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #4a5568;
`;

const RegisterLink = styled.a`
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
  text-align: center;
  margin-top: -10px;
`;

export default LoginPage;
