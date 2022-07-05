import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import PaymentForm from "./PaymentForm"

const PUBLIC_KEY = "pk_test_51LFusKJ4GbNGhfs44fqCcC6C34NC2QKuH5GXdsuSny9RbFX0D5QVj0U2v1MeuxGAj3yPS9SHF6ZDb09D3ceaYPWt00dpAyFO62"

const stripeTestPromise = loadStripe(PUBLIC_KEY)

export default function StripeContainer() {
	return (
		<Elements stripe={stripeTestPromise}>
			<PaymentForm />
		</Elements>
	)
}
