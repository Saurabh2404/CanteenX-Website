export function classifyProduct(name) {
  // Resolve laundry bars before the general personal-care soap rule.
  if (/surf excel|detergent|ariel|tide|\brin\b|\bvim\b/i.test(name))
    return "cleaning";
  if (/\bjoy\b|glow.*lovely|safe.*sun/i.test(name)) return "personal-care";
  if (
    /soap|shampoo|head & shoulder|head and shoulder|parkavenue|park avenue|fairness|moistur|handwash|tooth|paste|brush|hair|skin|cream|lotion|face|deo\b|perfume|sanitary|whisper|stayfree|diaper|shav|razor|blade|talc|body|vaseline|dettol|savlon|odomos|nivea|pond|lip|kajal|comb|gillette|colgate|pepsodent|sensodyne|dove|sunsilk|pantene|parachute|navratna/i.test(
      name,
    )
  )
    return "personal-care";
  if (
    /clean|detergent|surf|ariel|tide|rin\b|vim|lizol|harpic|comfort|scrub|phenyl|mop|broom|dhoop|agarbatti|incense|match|candle|mosquito|good ?knight|all ?out|hit\b|napkin|tissue|dishwash|wheel|ujala|odonil/i.test(
      name,
    )
  )
    return "cleaning";
  if (
    /cooktop|mixer|grinder|utensil|milton|bottle|lunch|steel|foil|cooker|pan\b|tawa|kadai|spoon|plate|glass|flask|container|tiffin/i.test(
      name,
    )
  )
    return "cooking-items";
  if (
    /bournvita|horlicks|complan|tea\b|chai|coffee|nescafe|bru\b|pepsi|coca|sprite|fanta|thums|maaza|frooti|juice|drink|beverage|tata tea|pansari chai/i.test(
      name,
    )
  )
    return "beverages";
  if (
    /sooji|sabudana|sattu|papad|panchphoran|masoori|zeeba|dalia|goal marich|atta|flour|maida|dalchinni|cinnamon|laung|clove|elaichi|cardamom|methi|hing|ajwain|sauf|saunf|mustard|refine|refined|coconut oil|soyabean|rice|basmati|dal\b|chana|rajma|chura|poha|suji|rava|besan|oil\b|ghee|sugar|salt|namak|masala|haldi|turmeric|chilli|pepper|jeera|cumin|dhaniya|coriander|amchoor|spice|vinegar|sauce|puree|soya|sevian|vermicelli/i.test(
      name,
    )
  )
    return "cooking-foods";
  if (
    /biscuit|cookie|oats|muesli|corn ?flakes|garden peas|chyawanprash|chyawanprakash|choco|snack|namkeen|bhujia|chips|lays|kurkure|parle|britannia|unibic|mcvities|dukes|cadbury|oreo|rusk|wafer|candy|toffee|bingo|haldiram|bikaji|maggi|noodle|pasta|jam|pickle|cerelac|dates|almond|pistach|cashew|peanut/i.test(
      name,
    )
  )
    return "food";
  return "daily-items";
}
export function discount(price, mrp) {
  return mrp > 0 && price >= 0 && price < mrp ? ((mrp - price) / mrp) * 100 : 0;
}

// Allow only floating-point noise at the inclusive 10% boundary.
export function discountedBestSellers(products) {
  return products
    .filter(
      (p) => p.popularityRank > 0 && discount(p.price, p.mrp) + 1e-9 >= 10,
    )
    .sort(
      (a, b) =>
        a.popularityRank - b.popularityRank || a.name.localeCompare(b.name),
    );
}
