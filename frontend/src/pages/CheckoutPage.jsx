import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, CreditCard, ShoppingBag, Package, Truck, Shield, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import axios from "axios";

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, setCart } = useCart();
    const [address, setAddress] = useState({
        fullName: "",
        phone: "",
        fullAddress: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        fetchCartData();
        window.scrollTo(0, 0);
    }, []);

    const fetchCartData = async () => {
        try {
            const response = await axios.get("/users/cartData");
            if (response.data.cart.items) {
                setCart(response.data.cart.items);
            } else {
                setCart([]);
            }
        } catch (err) { }
    }

    const isValidPincode = (pincode) => {
        return /^[1-9][0-9]{5}$/.test(pincode);
    };

    const isValidPhone = (phone) => {
        return /^[6-9]\d{9}$/.test(phone) && !/^(\d)\1{9}$/.test(phone);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            if (/^\d{0,10}$/.test(value)) setAddress({ ...address, [name]: value });
        } else if (name === "pincode") {
            if (/^\d{0,6}$/.test(value)) setAddress({ ...address, [name]: value });
        } else {
            setAddress({ ...address, [name]: value });
        }
    };

    const calculateItemTotal = (item) => {
        const basePrice = item.unitPrice * item.quantity;
        const taxRate = item.taxRate || 0;
        const taxType = item.taxType || "inclusive";

        if (taxType === "exclusive") {
            const taxAmount = (basePrice * taxRate) / 100;
            return basePrice + taxAmount;
        } else {
            return basePrice;
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const shipping = subtotal > 5000 ? 0 : 500;
    const total = subtotal + shipping;

    const handlePayment = async () => {
        if (
            !address.fullName ||
            !address.phone ||
            !address.fullAddress ||
            !address.city ||
            !address.state ||
            !address.pincode
        ) {
            toast.error("Please fill all address fields");
            return;
        }

        if (!isValidPhone(address.phone)) {
            toast.error("Invalid phone number. Must be 10 digits and start with 6–9.");
            return;
        }

        if (!isValidPincode(address.pincode)) {
            toast.error("Invalid pincode. Must be a 6-digit number and not start with 0.");
            return;
        }

        try {
            toast.promise(
                axios.post("/users/createOrder", { address, cart, total }),
                {
                    loading: "Processing payment...",
                    success: "Order placed successfully ✅",
                    error: "Order not placed❌",
                }
            ).then((res) => {
                const orderNumber = res.data.orderNumber;
                setCart([]);
                navigate(`/order-success/${orderNumber}`);
            })
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order");
            console.error("Error updating product:", error);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black overflow-hidden relative">
            {/* Artistic curved background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <svg className="absolute -top-20 -right-20 w-96 h-96 opacity-[0.03]" viewBox="0 0 400 400">
                    <path d="M 50,350 Q 150,50 350,150 Q 250,250 150,350 Q 100,300 50,350 Z" fill="black" />
                </svg>

                <svg className="absolute -bottom-32 -left-32 w-[600px] h-[600px] opacity-[0.03]" viewBox="0 0 400 400">
                    <path d="M 350,50 Q 250,350 50,250 Q 150,150 250,50 Q 300,100 350,50 Z" fill="black" />
                </svg>

                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-[0.02]" viewBox="0 0 800 400">
                    <path d="M 0,200 Q 200,50 400,200 T 800,200" stroke="black" strokeWidth="40" fill="none" strokeLinecap="round" />
                    <path d="M 0,220 Q 200,350 400,220 T 800,220" stroke="black" strokeWidth="30" fill="none" strokeLinecap="round" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-black hover:bg-gray-100 p-3 rounded-full transition-all border-2 border-transparent hover:border-black"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="relative">
                            <h1 className="text-4xl md:text-6xl font-black">
                                Checkout
                                <svg className="absolute -bottom-2 left-0 w-full h-3 opacity-20" viewBox="0 0 400 20">
                                    <path d="M 0,10 Q 100,0 200,10 T 400,10" stroke="black" strokeWidth="3" fill="none" />
                                </svg>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border-2 border-black shadow-lg">
                        <ShoppingBag size={22} className="text-black" />
                        <span className="font-bold text-lg">{cart.length} Items</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Section - Address & Items */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Address Form */}
                        <div className="relative bg-white p-8 rounded-3xl border-2 border-black shadow-xl">
                            <svg className="absolute top-0 left-0 w-20 h-20 opacity-5" viewBox="0 0 60 60">
                                <path d="M 0,60 Q 0,0 60,0" stroke="black" strokeWidth="3" fill="none" />
                            </svg>

                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform">
                                    <MapPin size={24} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-black">Shipping Address</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                <input
                                    name="fullName"
                                    value={address.fullName}
                                    onChange={handleChange}
                                    placeholder="Full Name"
                                    className="p-4 rounded-2xl bg-gray-50 border-2 border-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400"
                                />
                                <input
                                    name="phone"
                                    value={address.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number"
                                    inputMode="numeric"
                                    maxLength={10}
                                    className="p-4 rounded-2xl bg-gray-50 border-2 border-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400"
                                />
                                <input
                                    name="fullAddress"
                                    value={address.fullAddress}
                                    onChange={handleChange}
                                    placeholder="Full Address"
                                    className="p-4 rounded-2xl bg-gray-50 border-2 border-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all md:col-span-2 placeholder:text-gray-400"
                                />
                                <input
                                    name="city"
                                    value={address.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    className="p-4 rounded-2xl bg-gray-50 border-2 border-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400"
                                />
                                <input
                                    name="state"
                                    value={address.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    className="p-4 rounded-2xl bg-gray-50 border-2 border-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-gray-400"
                                />
                                <input
                                    name="pincode"
                                    value={address.pincode}
                                    onChange={handleChange}
                                    placeholder="Pincode"
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="p-4 rounded-2xl bg-gray-50 border-2 border-black focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition-all md:col-span-2 placeholder:text-gray-400"
                                />
                            </div>

                            <svg className="absolute bottom-0 right-0 w-20 h-20 opacity-5" viewBox="0 0 60 60">
                                <path d="M 60,0 Q 60,60 0,60" stroke="black" strokeWidth="3" fill="none" />
                            </svg>
                        </div>

                        {/* Order Items */}
                        <div className="relative bg-white p-8 rounded-3xl border-2 border-black shadow-xl">
                            <svg className="absolute top-0 right-0 w-20 h-20 opacity-5" viewBox="0 0 60 60">
                                <path d="M 60,0 Q 60,60 0,60" stroke="black" strokeWidth="3" fill="none" />
                            </svg>

                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center transform hover:rotate-6 transition-transform">
                                    <Package size={24} className="text-white" />
                                </div>
                                <h2 className="text-3xl font-black">Order Items</h2>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                {cart.map((item, index) => {
                                    const basePrice = item.unitPrice * item.quantity;
                                    const taxRate = item.taxRate || 0;
                                    const taxType = item.taxType || "inclusive";
                                    const itemTotal = calculateItemTotal(item);

                                    return (
                                        <div key={index} className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-black transition-all">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Package size={28} className="text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-black mb-1 truncate">{item.productName}</h3>
                                                    <p className="text-sm text-gray-600 mb-2 font-semibold">₹{item.unitPrice} × {item.quantity}</p>
                                                    {taxRate > 0 && (
                                                        <div className="text-xs text-gray-500 font-medium">
                                                            Tax: {taxRate}% {taxType === "inclusive" ? "(Incl.)" : "(Excl.)"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right ml-4">
                                                    <p className="text-lg font-black text-black whitespace-nowrap">
                                                        ₹{itemTotal.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <svg className="absolute bottom-0 left-8 w-32 h-2 opacity-10" viewBox="0 0 120 10">
                                <path d="M 0,5 Q 60,0 120,5" stroke="black" strokeWidth="2" fill="none" />
                            </svg>
                        </div>

                        <style>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 6px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: rgba(243, 244, 246, 1);
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: black;
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: rgba(0, 0, 0, 0.7);
                            }
                            .custom-scrollbar {
                                scrollbar-width: thin;
                                scrollbar-color: black rgba(243, 244, 246, 1);
                            }
                        `}</style>
                    </div>

                    {/* Right Section - Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="relative bg-white p-8 rounded-3xl border-2 border-black shadow-xl sticky top-24">
                            <svg className="absolute top-0 left-0 w-20 h-20 opacity-5" viewBox="0 0 60 60">
                                <path d="M 0,60 Q 0,0 60,0" stroke="black" strokeWidth="3" fill="none" />
                            </svg>

                            <h2 className="text-3xl font-black mb-8 relative">
                                Order Summary
                                <svg className="absolute -bottom-2 left-0 w-3/4 h-2 opacity-20" viewBox="0 0 200 10">
                                    <path d="M 0,5 Q 100,0 200,5" stroke="black" strokeWidth="2" fill="none" />
                                </svg>
                            </h2>

                            <div className="space-y-4 mb-8 mt-8 relative z-10">
                                <div className="flex justify-between items-center text-black">
                                    <span className="font-semibold">Subtotal (with taxes)</span>
                                    <span className="font-bold text-lg">₹{subtotal.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center text-black">
                                    <div className="flex items-center gap-2">
                                        <Truck size={18} className="text-black" />
                                        <span className="font-semibold">Shipping</span>
                                    </div>
                                    <span className="font-bold text-lg">
                                        {shipping === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `₹${shipping}`
                                        )}
                                    </span>
                                </div>

                                {subtotal < 5000 && subtotal > 0 && (
                                    <div className="bg-gray-50 border-2 border-black rounded-2xl p-4">
                                        <p className="text-sm font-semibold text-black">
                                            Add ₹{(5000 - subtotal).toFixed(2)} more for FREE shipping!
                                        </p>
                                    </div>
                                )}

                                <div className="border-t-2 border-black pt-4 flex justify-between items-center">
                                    <span className="text-2xl font-black">Total</span>
                                    <span className="text-3xl font-black text-black">
                                        ₹{total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                className="w-full group relative px-10 py-5 bg-black text-white rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 mb-6 cursor-pointer"
                            >
                                <span className="relative flex items-center justify-center gap-3">
                                    <CreditCard size={22} className="group-hover:rotate-12 transition-transform" />
                                    Pay ₹{total.toFixed(2)}
                                </span>
                            </button>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-black">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <CheckCircle size={14} className="text-green-600" />
                                    </div>
                                    <span className="font-medium">Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-black">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Shield size={14} className="text-green-600" />
                                    </div>
                                    <span className="font-medium">30-Day Money Back Guarantee</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-black">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Clock size={14} className="text-green-600" />
                                    </div>
                                    <span className="font-medium">Fast Delivery</span>
                                </div>
                            </div>

                            <svg className="absolute bottom-4 right-4 w-16 h-16 opacity-5" viewBox="0 0 60 60">
                                <path d="M 60,0 Q 60,60 0,60" stroke="black" strokeWidth="3" fill="none" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer decorative element */}
            <div className="relative h-20 overflow-hidden mt-12">
                <svg className="absolute bottom-0 left-0 w-full h-full opacity-5" viewBox="0 0 1000 100">
                    <path d="M 0,50 Q 250,0 500,50 T 1000,50 L 1000,100 L 0,100 Z" fill="black" />
                </svg>
            </div>
        </div>
    );
}