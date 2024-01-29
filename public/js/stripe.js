import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_BUkd0ZXAj6m0q0jMyRgBxNns00PPtgvjjr');

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout Session from api/server
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/users/bookings/checkout-session/${tourId}`,
    );
    // 2) create checkout form  + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('Error', error);
  }
};
