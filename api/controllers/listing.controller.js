import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';


// Create new listing
export const createListing = async (req, res, next) => {
  try {
    console.log("Python se aane wala data:", req.body);
    const newListing = new Listing({
      ...req.body,
      // Forcefully set fields if they exist in req.body
      originalCurrency: req.body.originalCurrency || 'INR',
      originalRegularPrice: req.body.originalRegularPrice || req.body.regularPrice,
      originalDiscountPrice: req.body.originalDiscountPrice || req.body.discountPrice,
      userRef: req.user.id,
       // yahan se sahi user id set hogi
    });

    const savedListing = await newListing.save();
    return res.status(201).json(savedListing);
  } catch (error) {
    console.error("Node side error:", error);
    next(error); 
  }
};

export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    
    // Default filters
    let offer = req.query.offer;
    if (offer === undefined || offer === 'false') offer = { $in: [false, true] };

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === 'false') furnished = { $in: [false, true] };

    let parking = req.query.parking;
    if (parking === undefined || parking === 'false') parking = { $in: [false, true] };

    let type = req.query.type;
    if (type === undefined || type === 'all') type = { $in: ['sale', 'rent'] };

    const searchTermRaw = (req.query.searchTerm || '').trim();
    // SMART LOGIC: Har word ko alag alag search karne ke liye split karein
    const keywords = searchTermRaw
      .split(/\s+/)
      .filter((word) => word !== '')
      .join('|');

    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';

    const filter = {
      offer,
      furnished,
      parking,
      type,
    };

    // IMPORTANT PERF: When searchTerm is empty, DO NOT run regex.
    // Regex with empty pattern forces wide scans and is a common cause of very slow home/search loads.
    if (keywords.length > 0) {
      filter.$or = [
        { name: { $regex: keywords, $options: 'i' } },
        { address: { $regex: keywords, $options: 'i' } },
        { description: { $regex: keywords, $options: 'i' } },
      ];
    }

    const listings = await Listing.find(filter)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex)
      .lean();

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

// Fast endpoint for home page (no regex, minimal fields, lean queries).
export const getHomeListings = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 4, 12);

    const select =
      'name address type offer regularPrice discountPrice currency imageUrls createdAt';

    const [offers, rent, sale] = await Promise.all([
      Listing.find({ offer: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(select)
        .lean(),
      Listing.find({ type: 'rent' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(select)
        .lean(),
      Listing.find({ type: 'sale' })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(select)
        .lean(),
    ]);

    return res.status(200).json({ offers, rent, sale });
  } catch (error) {
    next(error);
  }
};
export const getAllForChatbot = async (req, res, next) => {
  try {
    // Bina kisi condition aur limit ke saari listings fetch karein
    const listings = await Listing.find({}); 
    console.log(`Chatbot fetching: ${listings.length} listings found.`);
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};