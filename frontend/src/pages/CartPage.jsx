import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { debounce } from "../utils/debounce";
import toast from "react-hot-toast";
import axios from 'axios';

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, setCart, loading, removeFromCart } = useCart();

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
        } catch (err) {

        }
    }

    const goBack = () => {
        navigate(-1);
    }

    const updateCartQuantityAPI = async (cartItemId, quantity) => {
        try {
            toast.promise(
                axios.post("/product/updateCartQuantity", {
                    cartItemId,
                    quantity,
                }),
                {
                    loading: "Updating quantity...",
                    success: "Quantity updated ✅",
                    error: "Failed to update quantity ❌",
                }
            );
        } catch (err) {
            toast.error("Failed to update quantity ❌");
        }
    };

    const debouncedUpdate = useRef(debounce(updateCartQuantityAPI, 500)).current;

    const updateQuantity = async (id, change) => {
        const item = cart.find(i => i._id === id);
        if (!item) return;

        const newQuantity = item.quantity + change;

        if (newQuantity < item.minimumOrderQuantity) {
            toast.error(`Minimum order quantity is ${item.minimumOrderQuantity}`);
            return;
        }

        setCart(prev =>
            prev.map(i =>
                i._id === id ? { ...i, quantity: newQuantity } : i
            )
        );

        debouncedUpdate(id, newQuantity);
    };

    const removeItem = (id) => {
        removeFromCart(id);
    };

    const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shipping = subtotal > 5000 ? 0 : 500;
    const total = subtotal + shipping;

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
                            onClick={goBack}
                            className="text-black hover:bg-gray-100 p-3 rounded-full transition-all cursor-pointer border-2 border-transparent hover:border-black">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="relative">
                            <h1 className="text-4xl md:text-6xl font-black">
                                Shopping Cart
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

                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative flex flex-col items-center bg-gray-50 p-16 rounded-3xl border-2 border-black">
                            <svg className="absolute top-0 left-0 w-24 h-24 opacity-5" viewBox="0 0 60 60">
                                <path d="M 0,60 Q 0,0 60,0" stroke="black" strokeWidth="3" fill="none" />
                            </svg>
                            <svg className="absolute bottom-0 right-0 w-24 h-24 opacity-5" viewBox="0 0 60 60">
                                <path d="M 60,0 Q 60,60 0,60" stroke="black" strokeWidth="3" fill="none" />
                            </svg>
                            
                            <ShoppingBag size={80} className="text-gray-300 mx-auto mb-6" />
                            <h2 className="text-3xl font-black text-black mb-3">Your cart is empty</h2>
                            <p className="text-gray-500 text-lg mb-8">Add some products to get started!</p>
                            <Link to="/" className="group relative px-10 py-5 bg-black text-white rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105">
                                <span className="relative flex items-center gap-3">
                                    Continue Shopping
                                    <ArrowLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {cart.map((item, index) => (
                                <div
                                    key={index}
                                    className="group relative bg-white p-6 rounded-3xl border-2 border-black hover:shadow-2xl transition-all"
                                >
                                    <svg className="absolute top-0 right-0 w-20 h-20 opacity-5" viewBox="0 0 60 60">
                                        <path d="M 60,0 Q 60,60 0,60" stroke="black" strokeWidth="3" fill="none" />
                                    </svg>

                                    <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <div className="relative w-full sm:w-32 h-32 rounded-2xl overflow-hidden border-2 border-black">
                                                <img
                                                    src={item.mainImage}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-xl font-black text-black mb-2">
                                                    {item.productName}
                                                </h3>
                                                <p className="text-2xl font-black text-black">
                                                    ₹{item.unitPrice}
                                                </p>
                                            </div>

                                            {/* Quantity Controls & Remove Button */}
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 border-2 border-black">
                                                    <button
                                                        onClick={() => updateQuantity(item._id, -1)}
                                                        className="p-2 hover:bg-black hover:text-white rounded-full transition-all cursor-pointer"
                                                    >
                                                        <Minus size={18} />
                                                    </button>
                                                    <span className="w-12 text-center font-bold text-lg cursor-pointer">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item._id, 1)}
                                                        className="p-2 hover:bg-black hover:text-white rounded-full transition-all cursor-pointer"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item._id)}
                                                    className="text-red-600 hover:text-white hover:bg-red-600 p-3 rounded-full transition-all cursor-pointer border-2 border-red-600"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item Total (Desktop) */}
                                        <div className="hidden sm:flex items-start justify-end">
                                            <p className="text-2xl font-black text-black">
                                                ₹{item.unitPrice * item.quantity}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Item Total (Mobile) */}
                                    <div className="sm:hidden flex justify-between items-center mt-4 pt-4 border-t-2 border-gray-200">
                                        <span className="text-gray-600 font-semibold">Subtotal:</span>
                                        <p className="text-xl font-black text-black">
                                            ₹{item.unitPrice * item.quantity}
                                        </p>
                                    </div>

                                    <svg className="absolute bottom-0 left-8 w-32 h-2 opacity-10" viewBox="0 0 120 10">
                                        <path d="M 0,5 Q 60,0 120,5" stroke="black" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="relative bg-white p-8 rounded-3xl border-2 border-black sticky top-24">
                                <svg className="absolute top-0 left-0 w-20 h-20 opacity-5" viewBox="0 0 60 60">
                                    <path d="M 0,60 Q 0,0 60,0" stroke="black" strokeWidth="3" fill="none" />
                                </svg>

                                <h2 className="text-3xl font-black mb-6 relative">
                                    Order Summary
                                    <svg className="absolute -bottom-2 left-0 w-3/4 h-2 opacity-20" viewBox="0 0 200 10">
                                        <path d="M 0,5 Q 100,0 200,5" stroke="black" strokeWidth="2" fill="none" />
                                    </svg>
                                </h2>

                                <div className="space-y-4 mb-6 mt-8">
                                    <div className="flex justify-between text-black">
                                        <span className="font-semibold">Subtotal</span>
                                        <span className="font-bold">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-black">
                                        <span className="font-semibold">Shipping</span>
                                        <span className="font-bold">
                                            {shipping === 0 ? (
                                                <span className="text-green-600">FREE</span>
                                            ) : (
                                                `₹${shipping}`
                                            )}
                                        </span>
                                    </div>
                                    <div className="border-t-2 border-black pt-4 flex justify-between text-2xl font-black">
                                        <span>Total</span>
                                        <span>₹{total}</span>
                                    </div>
                                </div>

                                {shipping > 0 && (
                                    <div className="bg-gray-50 border-2 border-black rounded-2xl p-4 mb-6">
                                        <p className="text-sm font-semibold text-black">
                                            Add ₹{5000 - subtotal} more for FREE shipping!
                                        </p>
                                    </div>
                                )}

                                <Link to="/checkout">
                                    <button className="w-full group relative px-10 py-5 bg-black text-white rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 mb-4 cursor-pointer">
                                        <span className="relative flex items-center justify-center gap-3">
                                            Proceed to Checkout
                                            <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
                                        </span>
                                    </button>
                                </Link>

                                <Link to="/">
                                    <button className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white py-4 rounded-full font-bold transition-all cursor-pointer">
                                        Continue Shopping
                                    </button>
                                </Link>

                                <svg className="absolute bottom-4 right-4 w-16 h-16 opacity-5" viewBox="0 0 60 60">
                                    <path d="M 60,0 Q 60,60 0,60" stroke="black" strokeWidth="3" fill="none" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer decorative element */}
            <div className="relative h-20 overflow-hidden">
                <svg className="absolute bottom-0 left-0 w-full h-full opacity-5" viewBox="0 0 1000 100">
                    <path d="M 0,50 Q 250,0 500,50 T 1000,50 L 1000,100 L 0,100 Z" fill="black" />
                </svg>
            </div>
        </div>
    );
}