import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { authService } from '../../services/api';
export const Auth = ({ onAuth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await authService.login(userName, password);
            }
            else {
                await authService.register(userName, email, password);
            }
            onAuth(userName);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "auth-container", children: [_jsx("h2", { children: isLogin ? 'Login' : 'Register' }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { children: "Username:" }), _jsx("input", { type: "text", value: userName, onChange: (e) => setUserName(e.target.value), required: true })] }), !isLogin && (_jsxs("div", { children: [_jsx("label", { children: "Email:" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true })] })), _jsxs("div", { children: [_jsx("label", { children: "Password:" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), error && _jsx("div", { className: "error", children: error }), _jsx("button", { type: "submit", disabled: loading, children: loading ? 'Loading...' : (isLogin ? 'Login' : 'Register') })] }), _jsxs("button", { onClick: () => setIsLogin(!isLogin), children: ["Switch to ", isLogin ? 'Register' : 'Login'] })] }));
};
//# sourceMappingURL=Auth.js.map