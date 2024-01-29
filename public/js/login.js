import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  console.log(email, password);

  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.status === 'Success' || data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.message || 'An error occurred');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'Get',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out! Try Again');
  }
};
