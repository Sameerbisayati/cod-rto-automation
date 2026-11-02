
def get_whatsapp_template(
    language,
    message_type,
    customer_name,
    order_id,
    order_value=0,
    discount=0
):
    language = str(language or "ENGLISH").upper()

    if language not in ["ENGLISH", "HINDI", "HINGLISH"]:
        language = "ENGLISH"

    if message_type == "CONFIRMATION":
        templates = {
            "ENGLISH": (
                f"Hello {customer_name}! 👋\n\n"
                f"Thank you for placing order #{order_id}.\n"
                "Would you like us to deliver your order?\n\n"
                "Reply YES to confirm or NO to decline.\n"
                "Please reply within 24 hours."
            ),
            "HINDI": (
                f"नमस्ते {customer_name}! 👋\n\n"
                f"आपका ऑर्डर #{order_id} देने के लिए धन्यवाद।\n"
                "क्या आप अपना ऑर्डर प्राप्त करना चाहते हैं?\n\n"
                "पुष्टि करने के लिए YES और मना करने के लिए NO लिखें।\n"
                "कृपया 24 घंटे के अंदर जवाब दें।"
            ),
            "HINGLISH": (
                f"Hello {customer_name}! 👋\n\n"
                f"Order #{order_id} place karne ke liye thank you.\n"
                "Kya aap apna order receive karna chahte hain?\n\n"
                "Confirm karne ke liye YES aur decline karne ke liye NO reply karein.\n"
                "Please 24 hours ke andar reply karein."
            )
        }

    elif message_type == "PREPAID_NUDGE":
        discounted_total = round(float(order_value) - float(discount), 2)

        templates = {
            "ENGLISH": (
                f"Hello {customer_name}! 👋\n\n"
                f"Your order #{order_id} value is ₹{order_value:.2f}.\n"
                f"Pay online and get ₹{discount} OFF!\n"
                f"Your discounted total will be ₹{discounted_total:.2f}.\n\n"
                "Reply YES to proceed with prepaid payment."
            ),
            "HINDI": (
                f"नमस्ते {customer_name}! 👋\n\n"
                f"आपके ऑर्डर #{order_id} की कीमत ₹{order_value:.2f} है।\n"
                f"ऑनलाइन भुगतान करें और ₹{discount} की छूट पाएं!\n"
                f"छूट के बाद कुल कीमत ₹{discounted_total:.2f} होगी।\n\n"
                "प्रीपेड भुगतान के लिए YES लिखें।"
            ),
            "HINGLISH": (
                f"Hello {customer_name}! 👋\n\n"
                f"Aapke order #{order_id} ki value ₹{order_value:.2f} hai.\n"
                f"Online payment karein aur ₹{discount} OFF paayein!\n"
                f"Discount ke baad total ₹{discounted_total:.2f} hoga.\n\n"
                "Prepaid payment ke liye YES reply karein."
            )
        }

    else:
        raise ValueError("Invalid WhatsApp message type.")

    return templates[language]
