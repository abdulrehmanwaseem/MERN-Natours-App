import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'pass' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'passowrd'
        ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';

    const res = await axios({
      method: 'POST',
      url,
      data,
    });
    if (res.data.status === 'success' || 'Success') {
      showAlert('Success', `${type.toUpperCase()} Data updated successfully`);
    }
  } catch (error) {
    showAlert(error, 'Something went wrong');
  }
};
