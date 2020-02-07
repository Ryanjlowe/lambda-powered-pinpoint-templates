exports.handler = async (event) => {
    // Imagine this is a database call, or a webservice call, or anything!
    // event.Endpoint would contain the full Endpoint object as stored in Pinpoint
    return {
        "image": "https://images.unsplash.com/photo-1580750603266-cae8b4b9f72a",
        "name": "Bananas",
        "price": "$12.00",
        "link": "http://www.amazon.com"
    };
};
