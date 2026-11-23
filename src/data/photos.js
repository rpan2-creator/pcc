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

Object.assign(PHOTOS, {
  vehicle: [
    { src: T('3/3b/Abandoned_car_in_Tambov_-_001.jpg/960px-Abandoned_car_in_Tambov_-_001.jpg'), by: 'Alexander Novikov', lic: 'CC BY-SA 4.0', file: 'Abandoned_car_in_Tambov_-_001.jpg' },
    { src: T('c/c7/Abandoned_car%2C_Urgezes.jpg/960px-Abandoned_car%2C_Urgezes.jpg'), by: 'V.B.Speranza', lic: 'CC BY-SA 4.0', file: 'Abandoned_car,_Urgezes.jpg' },
  ],
  sign: [
    { src: U('6/67/I10ReadBentSign.jpg'), by: 'unknown', lic: 'CC BY 3.0', file: 'I10ReadBentSign.jpg' },
    { src: T('4/45/2025-08-05_%28Mutwillig%29_verbogenes_Schild_an_der_Lorenzpark-Ecke_gegen%C3%BCber_ehem._Gesch%C3%A4ft_%E2%80%9EZoo-G%C3%B6rnandt%E2%80%9C.jpg/960px-2025-08-05_%28Mutwillig%29_verbogenes_Schild_an_der_Lorenzpark-Ecke_gegen%C3%BCber_ehem._Gesch%C3%A4ft_%E2%80%9EZoo-G%C3%B6rnandt%E2%80%9C.jpg'), by: 'unregistered user', lic: 'CC BY-SA 4.0', file: 'verbogenes_Schild_Lorenzpark.jpg' },
  ],
  flood: [
    { src: T('5/5a/Storm_drains_clogged_-_heavy_rain_on_7th_avenue_%3D_flooding_-_panoramio.jpg/960px-Storm_drains_clogged_-_heavy_rain_on_7th_avenue_%3D_flooding_-_panoramio.jpg'), by: 'nick hoke', lic: 'CC BY 3.0', file: 'Storm_drains_clogged_-_heavy_rain_on_7th_avenue.jpg' },
    { src: T('b/bd/Banks_Street_Kayakers_-_Mid-City_New_Orleans_flooding_July_2019.jpg/960px-Banks_Street_Kayakers_-_Mid-City_New_Orleans_flooding_July_2019.jpg'), by: 'Bart Everson', lic: 'CC BY 2.0', file: 'Banks_Street_Kayakers_-_Mid-City_New_Orleans_flooding_July_2019.jpg' },
    { src: T('5/5c/Storm_Drains_After_TS_Arthur.jpg/960px-Storm_Drains_After_TS_Arthur.jpg'), by: 'IrishSurfer21', lic: 'CC0', file: 'Storm_Drains_After_TS_Arthur.jpg' },
  ],
  dumping: [
    { src: T('7/76/Mattress_in_Coventry_July_29_2021.jpg/960px-Mattress_in_Coventry_July_29_2021.jpg'), by: 'Rubbish computer', lic: 'CC BY-SA 4.0', file: 'Mattress_in_Coventry_July_29_2021.jpg' },
    { src: T('3/3b/Fly_tipping_near_High_Beech%2C_Essex.jpg/960px-Fly_tipping_near_High_Beech%2C_Essex.jpg'), by: 'The wub', lic: 'CC BY-SA 4.0', file: 'Fly_tipping_near_High_Beech,_Essex.jpg' },
    { src: U('0/0c/No_Fly_Tipping_at_the_Elephant_and_Castle_-_geograph.org.uk_-_1289337.jpg'), by: 'Arsons Den', lic: 'CC BY-SA 2.0', file: 'No_Fly_Tipping_at_the_Elephant_and_Castle.jpg' },
  ],
  park: [
    { src: T('1/11/Broken_bench_Briant_Pond_Park_Summit_NJ_2009.jpg/960px-Broken_bench_Briant_Pond_Park_Summit_NJ_2009.jpg'), by: 'Tomwsulcer', lic: 'Public domain', file: 'Broken_bench_Briant_Pond_Park_Summit_NJ_2009.jpg' },
    { src: T('2/2b/Ickworth_Park%2C_Suffolk%2C_England_-broken_bench-2March2012.jpg/960px-Ickworth_Park%2C_Suffolk%2C_England_-broken_bench-2March2012.jpg'), by: 'Karen Roe', lic: 'CC BY 2.0', file: 'Ickworth_Park_broken_bench.jpg' },
    { src: T('7/75/Barringun_playground.jpg/960px-Barringun_playground.jpg'), by: 'Peterdownunder', lic: 'CC BY-SA 4.0', file: 'Barringun_playground.jpg' },
  ],
  building: [
    { src: T('b/bb/Boarded_up_house_-_geograph.org.uk_-_5110886.jpg/960px-Boarded_up_house_-_geograph.org.uk_-_5110886.jpg'), by: 'Hugh Venables', lic: 'CC BY-SA 2.0', file: 'Boarded_up_house_-_geograph.org.uk_-_5110886.jpg' },
    { src: T('5/57/Boarded_up_house_at_Thornhills_-_geograph.org.uk_-_2849591.jpg/960px-Boarded_up_house_at_Thornhills_-_geograph.org.uk_-_2849591.jpg'), by: 'John Slater', lic: 'CC BY-SA 2.0', file: 'Boarded_up_house_at_Thornhills.jpg' },
  ],
})
// Bus shelter photo stands in for graffiti and vandalism on city property.
PHOTOS.graffiti.push({ src: T('e/eb/Temple_Newsam_-_vandalised_bus_shelter_%28geograph_5300176%29.jpg/960px-Temple_Newsam_-_vandalised_bus_shelter_%28geograph_5300176%29.jpg'), by: 'Stephen Craven', lic: 'CC BY-SA 2.0', file: 'Temple_Newsam_-_vandalised_bus_shelter.jpg' })
// Categories that residents rarely photograph (noise, heat, rodents, sewer) fall back to an icon tile.
export const NO_PHOTO = ['noise', 'heat', 'rodent', 'sewer']

export const EXTRA = {
  crosswalk: { src: T('c/cc/Preparing_for_Rim_of_the_Pacific_Exercises_with_a_Little_Crosswalk_Repainting_at_Pearl_Harbor_%2814244784072%29.jpg/960px-Preparing_for_Rim_of_the_Pacific_Exercises_with_a_Little_Crosswalk_Repainting_at_Pearl_Harbor_%2814244784072%29.jpg'), by: 'NAVFAC', lic: 'CC BY 2.0', file: 'Crosswalk_Repainting_at_Pearl_Harbor.jpg' },
  cityNight: { src: T('7/75/Cincinnati_aerial_at_night_2017.jpg/960px-Cincinnati_aerial_at_night_2017.jpg'), by: 'Antony-22', lic: 'CC BY-SA 4.0', file: 'Cincinnati_aerial_at_night_2017.jpg' },
  crew: { src: T('7/76/MassDOT_Pothole_Repairs_on_I-93%2C_Andover_Methuen%2C_March_5%2C_2010_%284408556649%29.jpg/960px-MassDOT_Pothole_Repairs_on_I-93%2C_Andover_Methuen%2C_March_5%2C_2010_%284408556649%29.jpg'), by: 'MassDOT', lic: 'Public domain', file: 'MassDOT_Pothole_Repairs_on_I-93.jpg' },
  paving: { src: T('7/7d/Road_crews_paving_asphalt_on_Euclid_Avenue_near_Euclid_Place.jpg/960px-Road_crews_paving_asphalt_on_Euclid_Avenue_near_Euclid_Place.jpg'), by: 'unknown', lic: 'Public domain', file: 'Road_crews_paving_asphalt_on_Euclid_Avenue.jpg' },
  plow: { src: T('1/1c/International_HV_Series_Snow_Plow_Truck.jpg/960px-International_HV_Series_Snow_Plow_Truck.jpg'), by: 'Gogerr', lic: 'CC BY-SA 4.0', file: 'International_HV_Series_Snow_Plow_Truck.jpg' },
  plow2: { src: U('3/33/VTrans_snow_plow_truck_VT_Rte_114_East_Haven_VT_February_2019.jpg'), by: 'Artaxerxes', lic: 'CC BY-SA 4.0', file: 'VTrans_snow_plow_truck.jpg' },
}

export const photoFor = (cat, seed = 0) => {
  const list = PHOTOS[cat]
  if (!list) return null
  return list[Math.abs(seed) % list.length]
}

// Photos for the home page vortex, tagged with what they show.
export const VORTEX = Object.entries(PHOTOS).flatMap(([cat, list]) => list.map(p => ({ ...p, cat }))).concat([{ ...EXTRA.crew, cat: 'crew' }, { ...EXTRA.plow, cat: 'plow' }, { ...EXTRA.crosswalk, cat: 'crew' }, { ...EXTRA.paving, cat: 'crew' }])

export const ALL_CREDITS = [...Object.values(PHOTOS).flat(), ...Object.values(EXTRA)]
