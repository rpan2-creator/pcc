// Real photos from Wikimedia Commons, loaded from their servers.
// Each entry keeps the author and licence so the credits page can show them.
const T = p => `https://thumb.wikimedia.org/wikipedia/commons/thumb/${p}`
const U = p => `https://upload.wikimedia.org/wikipedia/commons/${p}`

export const PHOTOS = {
  pothole: [
    { src: T('a/ad/A_pothole_in_Dilova_Street_in_Kyiv.jpg/960px-A_pothole_in_Dilova_Street_in_Kyiv.jpg'), by: 'Роман Рябенко', lic: 'CC0', file: 'A_pothole_in_Dilova_Street_in_Kyiv.jpg' },
    { src: T('8/86/Pothole_in_Villeray%2C_Montr%C3%A9al.jpg/960px-Pothole_in_Villeray%2C_Montr%C3%A9al.jpg'), by: 'Miguel Tremblay', lic: 'Public domain', file: 'Pothole_in_Villeray,_Montréal.jpg' },
    { src: T('9/94/Potholes_-_at_the_junction_of_Philip_Lane_N15_and_Mount_Pleasant_Road_N17.jpg/960px-Potholes_-_at_the_junction_of_Philip_Lane_N15_and_Mount_Pleasant_Road_N17.jpg'), by: 'Alan Stanton', lic: 'CC BY-SA 2.0', file: 'Potholes_-_at_the_junction_of_Philip_Lane_N15_and_Mount_Pleasant_Road_N17.jpg' },
    { src: T('2/2e/Pothole_on_Huntington_Creek_Road.JPG/960px-Pothole_on_Huntington_Creek_Road.JPG'), by: 'Jakec', lic: 'CC BY-SA 4.0', file: 'Pothole_on_Huntington_Creek_Road.JPG' },
  ],
  streetlight: [
    { src: T('9/9a/Broken_Street_Light_Stevenage_%28The_White_Way_Lamppost_26%29_-_geograph.org.uk_-_8268947.jpg/960px-Broken_Street_Light_Stevenage_%28The_White_Way_Lamppost_26%29_-_geograph.org.uk_-_8268947.jpg'), by: 'Andy', lic: 'CC BY-SA 2.0', file: 'Broken_Street_Light_Stevenage.jpg' },
    { src: T('a/ab/Damaged_public_street_light%2C_Feijenoord%2C_Rotterdam_%282021%29_04.jpg/960px-Damaged_public_street_light%2C_Feijenoord%2C_Rotterdam_%282021%29_04.jpg'), by: 'Donald Trung Quoc Don', lic: 'CC BY-SA 4.0', file: 'Damaged_public_street_light,_Feijenoord,_Rotterdam_(2021)_04.jpg' },
  ],
  signal: [
    { src: U('4/42/UK_Traffic_Lights_Not_Working_With_A_Traffic_Light_Out_Of_Order_Sign_-_geograph.org.uk_-_6106908.jpg'), by: 'Gary', lic: 'CC BY-SA 2.0', file: 'UK_Traffic_Lights_Not_Working.jpg' },
    { src: T('d/d3/MacauTrafficLightOutOfOrder.JPG/960px-MacauTrafficLightOutOfOrder.JPG'), by: 'cdip150', lic: 'Public domain', file: 'MacauTrafficLightOutOfOrder.JPG' },
  ],
  tree: [
    { src: T('5/59/Fallen_Tree_July_4th_wind_storm_damage_Parkside_Ave.jpg/960px-Fallen_Tree_July_4th_wind_storm_damage_Parkside_Ave.jpg'), by: 'Wil540 art', lic: 'CC BY 4.0', file: 'Fallen_Tree_July_4th_wind_storm_damage_Parkside_Ave.jpg' },
    { src: T('3/32/Fallen_tree_-_Blizzard_of_2010.JPG/960px-Fallen_tree_-_Blizzard_of_2010.JPG'), by: 'AgnosticPreachersKid', lic: 'CC BY-SA 3.0', file: 'Fallen_tree_-_Blizzard_of_2010.JPG' },
    { src: T('4/4c/Fallen_tree_lifts_sidewalk.jpg/960px-Fallen_tree_lifts_sidewalk.jpg'), by: 'Emma0mb', lic: 'CC BY 4.0', file: 'Fallen_tree_lifts_sidewalk.jpg' },
  ],
  drain: [
    { src: T('5/5a/Storm_drains_clogged_-_heavy_rain_on_7th_avenue_%3D_flooding_-_panoramio.jpg/960px-Storm_drains_clogged_-_heavy_rain_on_7th_avenue_%3D_flooding_-_panoramio.jpg'), by: 'nick hoke', lic: 'CC BY 3.0', file: 'Storm_drains_clogged_-_heavy_rain_on_7th_avenue.jpg' },
    { src: T('5/5c/Storm_Drains_After_TS_Arthur.jpg/960px-Storm_Drains_After_TS_Arthur.jpg'), by: 'IrishSurfer21', lic: 'CC0', file: 'Storm_Drains_After_TS_Arthur.jpg' },
  ],
  leak: [
    { src: T('e/e7/Peacock_Street_water_main_break_985.jpg/960px-Peacock_Street_water_main_break_985.jpg'), by: 'Schwede66', lic: 'CC BY-SA 4.0', file: 'Peacock_Street_water_main_break_985.jpg' },
    { src: T('6/62/Water_Main_Break_%2816479209973%29.jpg/960px-Water_Main_Break_%2816479209973%29.jpg'), by: 'Metropolitan Transportation Authority', lic: 'CC BY 2.0', file: 'Water_Main_Break_(16479209973).jpg' },
  ],
  sidewalk: [
    { src: T('0/0e/Broken_sidewalk_LA.jpg/960px-Broken_sidewalk_LA.jpg'), by: 'Downtowngal', lic: 'CC BY-SA 4.0', file: 'Broken_sidewalk_LA.jpg' },
    { src: T('b/ba/Cracked_sidewalk_in_Manhattan.jpg/960px-Cracked_sidewalk_in_Manhattan.jpg'), by: 'Eden, Janine and Jim', lic: 'CC BY 2.0', file: 'Cracked_sidewalk_in_Manhattan.jpg' },
  ],
  graffiti: [
    { src: U('8/84/Grapes_Hill_underpass_-_a_clean_wall_of_new_graffiti_-_geograph.org.uk_-_6501243.jpg'), by: 'Evelyn Simak', lic: 'CC BY-SA 2.0', file: 'Grapes_Hill_underpass_-_a_clean_wall_of_new_graffiti.jpg' },
    { src: U('1/1b/Graffiti_on_the_wall_of_the_ramp_to_St_Stephens_underpass_-_geograph.org.uk_-_6493781.jpg'), by: 'Evelyn Simak', lic: 'CC BY-SA 2.0', file: 'Graffiti_on_the_wall_of_the_ramp_to_St_Stephens_underpass.jpg' },
  ],
  trash: [
    { src: T('d/d7/Litter_bin_rubbish_Tottenham%2C_London%2C_England_1.jpg/960px-Litter_bin_rubbish_Tottenham%2C_London%2C_England_1.jpg'), by: 'Acabashi', lic: 'CC BY-SA 4.0', file: 'Litter_bin_rubbish_Tottenham,_London,_England_1.jpg' },
    { src: T('b/bb/Overflowing_Hamburg_street_garbage_bin.jpg/960px-Overflowing_Hamburg_street_garbage_bin.jpg'), by: 'unknown', lic: 'Public domain', file: 'Overflowing_Hamburg_street_garbage_bin.jpg' },
  ],
  snow: [
    { src: T('b/b8/MBTA_109_bus_and_SUV_stuck_in_snow_Dec_2024.jpg/960px-MBTA_109_bus_and_SUV_stuck_in_snow_Dec_2024.jpg'), by: '4300streetcar', lic: 'CC BY 4.0', file: 'MBTA_109_bus_and_SUV_stuck_in_snow_Dec_2024.jpg' },
    { src: T('c/cd/Bus_lane_and_unplowed_bike_lane_in_Washington%2C_DC.jpg/960px-Bus_lane_and_unplowed_bike_lane_in_Washington%2C_DC.jpg'), by: 'Sdkb', lic: 'CC BY-SA 4.0', file: 'Bus_lane_and_unplowed_bike_lane_in_Washington,_DC.jpg' },
  ],
}

export const EXTRA = {
  crew: { src: T('7/76/MassDOT_Pothole_Repairs_on_I-93%2C_Andover_Methuen%2C_March_5%2C_2010_%284408556649%29.jpg/960px-MassDOT_Pothole_Repairs_on_I-93%2C_Andover_Methuen%2C_March_5%2C_2010_%284408556649%29.jpg'), by: 'MassDOT', lic: 'Public domain', file: 'MassDOT_Pothole_Repairs_on_I-93.jpg' },
  paving: { src: T('7/7d/Road_crews_paving_asphalt_on_Euclid_Avenue_near_Euclid_Place.jpg/960px-Road_crews_paving_asphalt_on_Euclid_Avenue_near_Euclid_Place.jpg'), by: 'unknown', lic: 'Public domain', file: 'Road_crews_paving_asphalt_on_Euclid_Avenue.jpg' },
  plow: { src: T('1/1c/International_HV_Series_Snow_Plow_Truck.jpg/960px-International_HV_Series_Snow_Plow_Truck.jpg'), by: 'Gogerr', lic: 'CC BY-SA 4.0', file: 'International_HV_Series_Snow_Plow_Truck.jpg' },
  plow2: { src: U('3/33/VTrans_snow_plow_truck_VT_Rte_114_East_Haven_VT_February_2019.jpg'), by: 'Artaxerxes', lic: 'CC BY-SA 4.0', file: 'VTrans_snow_plow_truck.jpg' },
}

export const photoFor = (cat, seed = 0) => {
  const list = PHOTOS[cat] || PHOTOS.pothole
  return list[Math.abs(seed) % list.length]
}

export const ALL_CREDITS = [...Object.values(PHOTOS).flat(), ...Object.values(EXTRA)]
