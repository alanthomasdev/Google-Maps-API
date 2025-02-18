"use client";
import React, { useState, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMapsLibrary } from "@vis.gl/react-google-maps";
// import { Polygon } from "./maps/polygon"
import Supercluster from "supercluster";
import { Polygon } from "./maps/polygon";
import { Autocomplete, TextField } from "@mui/material";
import markersData from "../../../public/maps/markers";

export default function Maps() {
  const [open, setOpen] = useState(56);
  const [clusters, setClusters] = useState([]);
  const [zoom, setZoom] = useState(3);
  const [bounds, setBounds] = useState(null);
  const [center, setCenter] = useState({ lat: 1.2921, lng: 36.8219 });
  const mapRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [geoData, setGeoData] = useState([]);
  const [hoveredPolygon, setHoveredPolygon] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [val, setVal] = useState([]);
  const [cat, setCat] = useState([]);

  const valHtml = val.map((option, index) => {
    // This is to handle new options added by the user (allowed by freeSolo prop).
    const label = option.title || option;
    return (
      <div className="flex me-2 items-center p-4 my-[5px] h-[26px] bg-[#00495D] rounded-[5px] text-white size-fit" key={label}>
        <button className="text-sm">{label}</button>
        <img
          className="w-[10px] h-[10px] ms-2 text-white"
          onClick={() => {
            setVal(val.filter((entry) => entry !== option));
          }}
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABaElEQVR4nO2ZQW7CMBBFs6JLEEu4CSFSuyk9OizoXShl/ZBVWyoVpLE9tgfLf534+yUzzmSm65qampqqFPAC7IB1Bq818AHMpBdeAAd+dAK2oga3XlvrgfVcSC08/wXh9A28ihjcevXA1x+vT2CZAiIJzAOIeBibE48gnM4SYWbDyaw1pkNQzthkm6IomIkQTrvQk8Ml3X8yGxkCPAYPiBOw8gaxRpuRuL2XM29COSGfj54wlykw2SFSwBSDkIQpDiEBowYiBkYdROCxefa8duhyyvMp63oTCWHKQQjClIcQgNEDEQGjDyIQZFI58yyhpQeG+GQvD4Pc8VsOBvkPYn6YKkoUAgpAz3suOSrf4CpWTQWMwEaKwyC4gZL/6720cYkOSp/KMBsMtTTo0Nkyfa+hib0PHvzYsYJZIMdYYaw7c5SakewzDXo2d2DiIaoavTmZ+LTD0LDWvoeAlUls8WFoU1NTU6dFV9Dns8U7gsRmAAAAAElFTkSuQmCC"
          alt="delete-sign"
        />
      </div>
    );
  });

  const valHtml1 = cat.map((option, index) => {
    // This is to handle new options added by the user (allowed by freeSolo prop).
    const label = option.title || option;
    return (
      <div className="flex me-2 items-center p-4 my-[5px] h-[26px] bg-[#00495D] rounded-[5px] text-white size-fit" key={label}>
        <button className="text-sm">{label}</button>
        <img
          className="w-[10px] h-[10px] ms-2 text-white"
          onClick={() => {
            setCat(cat.filter((entry) => entry !== option));
          }}
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABaElEQVR4nO2ZQW7CMBBFs6JLEEu4CSFSuyk9OizoXShl/ZBVWyoVpLE9tgfLf534+yUzzmSm65qampqqFPAC7IB1Bq818AHMpBdeAAd+dAK2oga3XlvrgfVcSC08/wXh9A28ihjcevXA1x+vT2CZAiIJzAOIeBibE48gnM4SYWbDyaw1pkNQzthkm6IomIkQTrvQk8Ml3X8yGxkCPAYPiBOw8gaxRpuRuL2XM29COSGfj54wlykw2SFSwBSDkIQpDiEBowYiBkYdROCxefa8duhyyvMp63oTCWHKQQjClIcQgNEDEQGjDyIQZFI58yyhpQeG+GQvD4Pc8VsOBvkPYn6YKkoUAgpAz3suOSrf4CpWTQWMwEaKwyC4gZL/6720cYkOSp/KMBsMtTTo0Nkyfa+hib0PHvzYsYJZIMdYYaw7c5SakewzDXo2d2DiIaoavTmZ+LTD0LDWvoeAlUls8WFoU1NTU6dFV9Dns8U7gsRmAAAAAElFTkSuQmCC"
          alt="delete-sign"
        />
      </div>
    );
  });

  const chips = ["Zambia", "Kenya", "Sudan", "Angola", "Cameroon"];
  const chipsCat = ["Health", "Food", "Agriculture",];

  const [markers, setMarkers] = useState(markersData);

  // Use a ref to store Supercluster instance
  const clusterRef = useRef(
    new Supercluster({
      radius: 60,
      maxZoom: 16,
    })
  );

  useEffect(() => {
    fetch("/maps/custom.geoindia.json")
      .then((response) => response.json())
      .then((geoJSON) => {

        setMarkers((prevMarkers) => {
          if (!val.length) {
            if(cat.length){
              return markersData.filter((marker) => cat.includes(marker.category));
            }else{
              return markersData; // Reset to all markers if no selection
            }
          }
          else if (!cat.length) {
            return markersData.filter((marker) => val.includes(marker.country));
          }
          else{
            return markersData.filter((marker) => val.includes(marker.country) && cat.includes(marker.category));
          }
        });

        // 🔹 Filter features that match any country in selected options
        const filteredGeoJSON = {
          ...geoJSON,
          features: geoJSON.features.filter((feature) => val.includes(feature.properties.geounit)),
        };


        const encodedData = encodeGeoJSONPolygons(!val.length ? geoJSON : filteredGeoJSON);
        setGeoData(encodedData);
      });


  }, [val, cat]);



  const clusterExpansionAnimation = {
    transition: "transform 5s ease-in-out, opacity 5s ease-in-out",
    transform: "scale(1.2)",
    opacity: "1",
  };
  const [isVisible, setIsVisible] = useState(false);

  function encodeGeoJSONPolygons(geoJSON) {
    if (!google.maps || !google.maps.geometry || !google.maps.geometry.encoding) {
      console.error("Google Maps Geometry Library is not loaded yet!");
      return [];
    }

    const features = Array.isArray(geoJSON.features) ? geoJSON.features : [geoJSON.features];

    return features.flatMap((feature) => {
      const geometryType = feature.geometry.type;
      const polygons =
        geometryType === "MultiPolygon"
          ? feature.geometry.coordinates // MultiPolygon: multiple coordinate sets
          : [feature.geometry.coordinates]; // Polygon: single coordinate set

      return polygons.map((rawCoordinates) => {
        const formattedCoordinates = rawCoordinates[0].map(([lng, lat]) => ({ lat, lng }));

        return google.maps.geometry.encoding.encodePath(formattedCoordinates); // Return only the encoded path
      });
    });
  }

  // This effect will trigger the fade-in animation when the component is mounted
  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false); // Clean-up for fade-out when closed
  }, [open]);

  useEffect(() => {
    if (!bounds) return;

    const cluster = clusterRef.current;
    cluster.load(
      markers.map((marker) => ({
        type: "Feature",
        properties: { cluster: false, markerId: marker.id, info: marker.info },
        geometry: { type: "Point", coordinates: [marker.position.lng, marker.position.lat] },
      }))
    );

    setClusters(cluster.getClusters([bounds.west, bounds.south, bounds.east, bounds.north], zoom));
  }, [zoom, bounds, markers]);

  // Function to handle cluster click and zoom in
  const handleClusterClick = (item) => {
    if (!item.properties.cluster) {
      return;
    }

    // Cluster expansion handling
    const clusterId = item.properties.cluster_id;
    if (clusterId === undefined) return;

    const cluster = clusterRef.current;
    if (!cluster) return;

    const expansionZoom = cluster.getClusterExpansionZoom(clusterId);
    if (expansionZoom === undefined) {
      console.warn("Cluster ID not found in Supercluster:", clusterId);
      return;
    }

    setZoom(Math.min(expansionZoom, 16));
    setCenter({ lat: item.geometry.coordinates[1], lng: item.geometry.coordinates[0] });
  };

  const openWindow = (id) => {
    const marker = markers.find((m) => m.id === id);
    if (marker) {
      const offsetLat = 0.5; // Adjust this value as needed
      setCenter({
        lat: marker.position.lat + offsetLat, // Move map slightly downward
        lng: marker.position.lng,
      });

      setZoom(8);
      setSelectedMarker(marker);
      if (mapRef.current) {
        mapRef.current.panTo(marker.position);
      }
    }
  };


  const handleCountryClick = (chip) =>{

    if(!val.includes(chip)) setVal([...val, chip])
  }
  const handlePolygonClick = (data) =>{
    fetch("/maps/custom.geoindia.json")
    .then((response) => response.json())
    .then((geoJSON) => {
      // const area = geoJSON.features[data].properties.geounit; 
      handleCountryClick(geoJSON.features[data].properties.geounit);
    })
  }

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY} libraries={["geometry"]}>
      <div className="flex flex-col xl:flex-row relative">
        <div className="filters xl:w-[30%] p-2 xl:h-[700px]  overflow-y-auto">
          <div>
            <Autocomplete
              multiple
              filterSelectedOptions
              options={chips}
              onChange={(e, newValue) => setVal(newValue)}
              getOptionLabel={(option) => {
                return option;
              }}
              renderTags={() => {}}
              value={val}
              renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Search by location" margin="normal" fullWidth />}
            />
            <div className="selectedTags flex flex-wrap">{valHtml}</div>
          </div>
          <div>
            <Autocomplete
              multiple
              filterSelectedOptions
              options={chipsCat}
              onChange={(e, newValue) => setCat(newValue)}
              getOptionLabel={(option) => {
                return option;
              }}
              renderTags={() => {}}
              value={cat}
              renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Search by category" margin="normal" fullWidth />}
            />
            <div className="selectedTags flex flex-wrap">{valHtml1}</div>
          </div>

          {/* <div className="dataChips flex flex-wrap max-w-[100%]">
            {selectedOptions.map((chip, index) => (
              <div className="flex me-2 items-center p-4 my-[5px] h-[26px] bg-[#00495D] rounded-[5px] text-white size-fit" key={index}>
                <button className="text-sm">{chip}</button>
                <img
                  className="w-[10px] h-[10px] ms-2 text-white"
                  onClick={()=>{setSelectedOptions(selectedOptions.filter((item)=>item!==chip))}}
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABaElEQVR4nO2ZQW7CMBBFs6JLEEu4CSFSuyk9OizoXShl/ZBVWyoVpLE9tgfLf534+yUzzmSm65qampqqFPAC7IB1Bq818AHMpBdeAAd+dAK2oga3XlvrgfVcSC08/wXh9A28ihjcevXA1x+vT2CZAiIJzAOIeBibE48gnM4SYWbDyaw1pkNQzthkm6IomIkQTrvQk8Ml3X8yGxkCPAYPiBOw8gaxRpuRuL2XM29COSGfj54wlykw2SFSwBSDkIQpDiEBowYiBkYdROCxefa8duhyyvMp63oTCWHKQQjClIcQgNEDEQGjDyIQZFI58yyhpQeG+GQvD4Pc8VsOBvkPYn6YKkoUAgpAz3suOSrf4CpWTQWMwEaKwyC4gZL/6720cYkOSp/KMBsMtTTo0Nkyfa+hib0PHvzYsYJZIMdYYaw7c5SakewzDXo2d2DiIaoavTmZ+LTD0LDWvoeAlUls8WFoU1NTU6dFV9Dns8U7gsRmAAAAAElFTkSuQmCC"
                  alt="delete-sign"
                />
              </div>
            ))}
            <button className="text-sm text-[#333333] font-bold underline ml-auto" onClick={()=>{setSelectedOptions([])}}>Reset</button>
          </div> */}
          <div className="indoDiv pt-4 bg-[#f2f2f2] p-3 mt-4">
            <div className="Header border-b-[0.5px] border-[#BBBBBB] pb-2">
              <h1 className="font-bold text-md">Top Funding by Regions</h1>
            </div>
            <div>
              {
                chips.map((chip, index)=>(
                  <div className="flex justify-between items-center py-2" key={index}>
                  <button className="text-sm ">{chip}</button>
                  <button className="underline font-bold text-sm text-[#00495D]" onClick={()=>handleCountryClick(chip)}>See All</button>
                </div>
                ))
              }
            </div>
          </div>

          <div className="indoDiv pt-4 bg-[#f2f2f2] p-3 mt-4 rounded-[5px] hidden xl:block">
            <div className="Header border-b-[0.5px] border-[#BBBBBB] pb-2">
              <h1 className="font-bold text-md">Top Funders</h1>
            </div>
            <div>
              <div className="flex justify-between items-center py-2">
                <button className="text-sm ">KCDF Organisation , Kenya</button>
                <button className="underline font-bold text-sm text-[#00495D]" onClick={()=>{setOpen(72); openWindow(72)}}>$300 MN</button>
              </div>
              <div className="flex justify-between items-center py-2">
                <button className="text-sm ">Sequoia Capital, India</button>
                <button className="underline font-bold text-sm text-[#00495D]" onClick={()=>{setOpen(71); openWindow(71)}}>$300 MN</button>
              </div>
              <div className="flex justify-between items-center py-2">
                <button className="text-sm ">Kalari Capital, USA</button>
                <button className="underline font-bold text-sm text-[#00495D]" onClick={()=>{setOpen(70);openWindow(70) }}>$300 MN</button>
              </div>
              <div className="flex justify-between items-center py-2">
                <button className="text-sm">SACCO, Kenya</button>
                <button className="underline font-bold text-sm text-[#00495D]" onClick={()=>{setOpen(60); openWindow(60)}}>$300 MN</button>
              </div>
            </div>
          </div>

          {/* <div className="indoDiv pt-4 bg-[#f2f2f2] p-3 mt-4 rounded-[5px]  hidden xl:block">
            <div className="Header border-b-[0.5px] border-[#BBBBBB] pb-2">
              <h1 className="font-bold text-md">Top Funding by Regions</h1>
            </div>
            <div>
              <div className="flex justify-between items-center py-2">
                <button className="text-sm ">Kenya</button>
                <button className="underline font-bold text-sm text-[#00495D]">See All</button>
              </div>
              <div className="flex justify-between items-center py-2">
                <button className="text-sm ">Kenya</button>
                <button className="underline font-bold text-sm text-[#00495D]">See All</button>
              </div>
              <div className="flex justify-between items-center py-2">
                <button className="text-sm ">Kenya</button>
                <button className="underline font-bold text-sm text-[#00495D]">See All</button>
              </div>
              <div className="flex justify-between items-center py-2">
                <button className="text-sm">Kenya</button>
                <button className="underline font-bold text-sm text-[#00495D]">See All</button>
              </div>
            </div>
          </div> */}
        </div>
        {openModal && (
          <div className="xl:w-[25%] w-[100%] h-[700px] bg-white shadow-md rounded-r-lg p-4 top-0 left-0 z-10" style={{ transform: isVisible ? "translateX(0)" : "translateX(100%)" }}>
            <div className="flex items-center justify-end cursor-pointer absolute right-[20px] z-10" onClick={() => setOpenModal(false)}>
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADFElEQVR4nO1aTWsUQRCdkx8HJYIab3pTgqd40psiSiCiR4m/wRD8F34cFAXx6k9QF+M/COJxyW66X3X1rEYiimfjiis1mWUTd2ZnerZnZjekoGFhu3vqzXtdXdU9QXBg+9TCMDxhtL7NwGNL1LBAm4GflmhbWvQbaMl/0ifqyzwTTIIppQ5bonsWWGXgjyXqubR4zHsmWpK5gqqNmY8w0QMGNl2dTwVF9IWBFZm7GhDAAhPBF4AEQNoYc7M0AEI9Ez0rC0CC7F53Op2jXkEQ0SwTfaoKhB2A+QjgtBcQzHxO6K4ahB1ITYkPY4FQSp2SMFoXCDsAA2Y+M05kqlxOdoTMCoVoS/SybuftMJjnbmwAC3U7bVOaMeZG/t0a2KjbYZvGCpHOtWnKjl23szarAcuZbEiqULujlMnK55ELP0oAXSfV+rLVet4CWwXe7FY0Vusrzs8F7qYDAT44O6P1fDRWqTknMNJXqTkZGwKXCjDTSK0niqTiux3KDabIGBqSV1cpdXx4kWt9ZwzdfusAF2UeY8x5Br7m6cvMFzL69jLaYpKsnowxYb637IEJu5eVR0kLvTEWkGxmfDLRi4AAb4alRaQ8AEl+656ZsINntZOA/PAyeRKYMkBQJK3vSdLa9gbkPyn5lJPd235VDiRHNPMDZP9IC54y3moXe6v08JuwJlw2zV7x8Ltz1OmXiSJ9yElaD0tLUXJEJ5/MLA4DYZ6ZpqTREv1OTBrjBb86LWk8E71LBBGH4CXnCbW+GhVGxQsrGXvNa2GlpqjUbTabh1KBxNFrpW5HbVbT+v5IEH1WJuGY1KazoXKfOMr9xESCAP6GRNdzgdglsRcTyMZTJxB9icnBcd3O234D1jIXeJptttsnJ+VagYhmAw8XPapGJjaMMWcDHybXX7XIDFiTy6agjMtQiRwVyelVqXfvcj9RqtSAtnOILWrxprksqYJHEB3ZsWv5AkLCoSRv0fclRN0C8ulKFitzFA6tvk1qg5DolhxjMvBW6un4QGPnoxr5DaxLeSqVnRRFrVbrmHdHDiyYDPsHTKdwmsyBd1EAAAAASUVORK5CYII="
                alt="cancel"
              />
            </div>
            <div className="absolute top-0 left-0 w-full">
              <img className="h-[300px] w-[100%]" src={selectedMarker.image} alt="" />
            </div>
            <div className="pt-[300px]">
              <p className=" text-2xl font-bold">{selectedMarker.info}</p>
              <p className=" text-base mt-2">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eius voluptas nostrum eos, pariatur corrupti id sit nisi ipsa quia placeat? </p>
              <div className="flex flex-col mt-4">
                {/* <button className="p-[25px] bg-[#4cacc7] text-white text-lg text-bold rounded-[10px]">Donations : $5000</button>
            <button className="mt-2 p-[25px] bg-[#4cacc7] text-white text-lg text-bold rounded-[10px]">26 Mar 2025</button> */}
              </div>
              <div>
                <h3 className="text-lg font-bold text-black">
                  $4219.310 raised <span className="font-bold text-lg text-[#B2BEB5]">of $6300.000 </span>
                </h3>
                <div className="w-full mt-3 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-[#4cacc7] h-2.5 rounded-full w-[65%]"></div>
                </div>
              </div>
              <div>
                <button className="p-2 bg-[#c9d1cb] rounded-[20px] m-2 text-black">#donate</button>
                <button className="p-2 bg-[#c9d1cb] rounded-[20px] m-2 text-black">#kenya</button>
                <button className="p-2 bg-[#c9d1cb] rounded-[20px] m-2 text-black">#volunteer</button>
              </div>
              <div className="flex items-center justify-end mt-4 h-[50px]">
                <img
                  className="h-[30px]"
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAClklEQVR4nO2Vz2vTYBzGo4KC/8IQVExE/wG9m2DRvNZLKcm0Tc3bbYIb3dxpbVqHIF2yetGTeHFgO3YdpN5Fp6f5B+hVbxvSMUGhX3nfdpbN/HrTruTwfuCB0rTP+zzv+00iCBwOh8PhcDjJAdzUGWirc9BWP4GL9qh6n2fJNSHJwObtCXDRF2gj8NE2+Y2Q2J13A8MPSiTxJICOTWj4nt6hR0LSABd9jlygrW6NN1xLegYtaRdaElA1xV14e+np4QJqJ3IBV+2w+scGWuLWP+OjakofYhVoo5+s/rHo7wwEal1cjjtCwOAft8DgWH0l7vQLzLLexMDgH69AU+qGLtCUuoMXGNqO9BjdyJxm9Y9FpAVagwXoiyy4xKEXGTD6xyggMh8x2V0yImTO6Y1NhT7S7/o7P4w/E+RRFmGBJ0n1p5BHmb/55ffCkMAx+/cWWReXyVHSmaVzK+4MvTNj9Gcik9k4Vag5Vw3LThtVJ09l2en7lfqVWq12Ukgq+aXGdcNyXhoV54dhOeAt+3u+Yr8oWM61sQVTp6bO3tBxWp7EJVk3G1Tk82TxDrlmlFfPGRV7zT+0t/KWs1moPb8Y5h87uHIPX1A0vCZreE/RMXhJxXP7uXL9N2v4A+XKK39Qcf6Xn7+imx1FN9/czE6fZwov6w8WFQ0HGGO4O7NIRiJW8CNjBenpx77r9IvsKxpeCA1ObjJZM18Hm2FAuDSi8E5vnCoOoGIppAQGRTNfCYJwImDnzUaYSSr3EPLllZGFNw7GaakOqdxMaAlZN23vmddMFLoDOobsQnXk4Y2+svPV8FPQcVfWzFv/F9DxtygFRjk6hsf9ECWDoptfvQpE+vPxhXeooubgBYyknQCHw+FwOBxh/PwFIqf2OHYasqwAAAAASUVORK5CYII="
                  alt="conference-call--v1"
                />
                <p className="text-sm font-bold ms-4">250+ Donations</p>
              </div>
            </div>
            <div className="flex items-center justify-center left-0 absolute bottom-[5px] w-[100%] mt-2">
              <button className="flex items-center justify-center w-[95%] p-[15px] bg-[#4cacc7] text-white text-lg text-bold rounded-[5px]">
                <img
                  className="h-[30px] mr-3"
                  src="data:image/png;base64,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"
                  alt="donate"
                />
                <span>Donate Now</span>
              </button>
            </div>
          </div>
        )}

        <div className={`${openModal ? "w-5/6" : "w-[100%]"} transition-all duration-300`} style={{ height: "700px" }}>
          <Map
            zoom={zoom}
            center={center}
            ref={mapRef}
            mapId={process.env.NEXT_PUBLIC_MAP_ID}
            onZoomChanged={(event) => setZoom(event.detail.zoom)}
            onBoundsChanged={(event) => setBounds(event.detail.bounds)}
            options={{
              draggable: true,
              minZoom: 3,
              maxZoom: 18,
              restriction: null,
            }}
          >
            {geoData.length > 0 &&
              geoData.map((polygon, index) => (
                <Polygon
                  key={index}
                  strokeWeight={1.5}
                  encodedPaths={[polygon]}
                  options={{
                    fillColor: hoveredPolygon === index ? "orange" : "yellow",
                    fillOpacity: 0.6,
                    strokeColor: "#000000",
                    strokeWeight: 1,
                  }}
                  onMouseOver={() => setHoveredPolygon(index)}
                  onMouseOut={() => setHoveredPolygon(null)}
                  onClick={() => handlePolygonClick(index)}
                />
              ))}
            {/* <Polygon strokeWeight={1.5} encodedPaths={geoData} options={{
            fillColor: "black",
            fillOpacity: 0.6,
            strokeColor: "#000000",
            strokeWeight: 1,
          }} /> */}
            {clusters.map((item) => {
              if (!item.geometry || !item.geometry.coordinates) return null;

              const [lng, lat] = item.geometry.coordinates;
              const isCluster = item.properties.cluster;

              if (isCluster) {
                return (
                  <AdvancedMarker key={item.id} position={{ lat, lng }} onClick={() => handleClusterClick(item)}>
                    <div
                      style={{
                        background: "#4cacc7",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      {item.properties.point_count}
                    </div>
                  </AdvancedMarker>
                );
              }

              return (
                <AdvancedMarker
                  key={item.properties.markerId}
                  position={{ lat, lng }}
                  onClick={() => {
                    setOpen(item.properties.markerId);
                    openWindow(item.properties.markerId);
                  }}
                >
                  <div className="flex items-center bg-white p-2 rounded-[50px] shadow-md">
                    <img
                      className="w-[15px]"
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADD0lEQVR4nO2aXUuUURDHf6C5gSa+1HaZd4VQ2ncIJTDswkL0Myjit8gVTZQus09QZkn1DSKiwKjVtaterpKgukk32jgwCzHNaZ999nmePSv+4cC+zDNnZufMzP8MC8c4uugFxoECsAXsAF+BA1nudVG+K4hsD4EgB0wDT4FfQKXO5Z55AkyJrsxxEpgHPscw3rc+AXOiOxNcBd4n6IBee8Bomg64X+pODSNeAYvABHBJ8uaErF75bEJkXtfQtZbGcTsLvPRs+A24BZyPofcCsCA6LN0vgHxSTgxIuPUmh1J9kqg8vRKlQ2OfktjQcCQsJ97KMUkaQ8A7jzP5RnLCOk73gU7SQyfwwHPMYuWMldh3gTbSRxuwbuy/GqfEWpHIwokq3F4bhh0jRIQL36562L0/RfboNHJmL2rTnDeqUxqJHRXDQFnZNBslGpp2uDrfbCwpmz7WSvxpo9mFwFD7gO/Ktsn/PfBMCbuOHQoWlW3uOuDtrpqKx6EdaWFQ2ebyptsSvG4QwNCwrWy8FiV07n1oWIpSiB4rIUe3Q8NNZeMjS6ikhC4SHoaUjW4u8A/2lZAreaHhtLLxiyV0oIQ6CA85ZePPI+3IvhLqp0WP1m4LJnvxqJTfTUuo0AINcTkKFxxXQm7uFBreKBvHLKEegzS6uVOopPHQRxqRYXRolyofF3Q57cWUcbFy9L7Z6Ad+1HOxyslUPLSkv61s+hClYc8ZZ9HV72bhsjF8mInyYE5YZajjoFI9E8dR9XBFxphZDujagYfKht/AlXoVrRnOrGfkTDtwz9h/JY6ynAyOtTI3xuwiPXQZkXDreSOMPG/cHKtkzU0A00jsHWM/l6NnGlU+4HGmLMOAvoT6hCuxZY8T50gIec8xq8gEsCAUol4MSp/Sza7y13FqOBJWzqx6NqyubYnSDek9fXKuO+RXHxYqvmwQQF2dVtK+pY54jlpSaydOiW0kOrMyFU/KAUc7Zpr1D4gOIW9bnkSttcrCYidDGnZ0yyx2QSaARRloVP9Usy90Y1NudmNNoj3HIAv8AQueC0fLPOrbAAAAAElFTkSuQmCC"
                      alt="circled"
                    />
                    <p className="ps-2 text-md font-bold ">{item.properties.markerId}</p>
                  </div>

                  {open === item.properties.markerId && (
                    <InfoWindow key={item.properties.markerId} position={{ lat, lng }} onCloseClick={() => setOpen(null)} options={{ disableAutoPan: true }}>
                      <div id="iw-container" className={`fade-in relatiive ${isVisible ? "visible" : "hidden"}`}>
                        <button
                          onClick={() => setOpen(null)}
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            borderRadius: "50%",
                            padding: "5px",
                            backgroundColor: "white",
                          }}
                        >
                          <img className="w-[25px] m-2" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAv0lEQVR4nO2VXQrCMBAGxwtalZY86NkVLP6hN6hQCaQgJdXdsFHEDOQt+02TbBooFP6JBrgBB2ChqFsCJ+AK1FrpLBT2YXSAE9S5MHeo8xlqLk8BEvlY6sc5RbyKBE3JY9IuZCRRRwLvwGbUC7E561SpRJ5N+m4rpUdhvvJsK5XKs0qZONNYw31E2ueUu280V/Piykjuubl0wFxeGfwyfYaa1uCR2KeIjwbPos9QU4Uv3iq3zM/dhdp5irhQ+E0ekyummbane5EAAAAASUVORK5CYII=" alt="multiply"></img>
                        </button>

                        <button
                          onClick={() => setOpen(null)}
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "65px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            borderRadius: "50%",
                            padding: "5px",
                            backgroundColor: "white",
                          }}
                        >
                          <img
                            className="w-[25px] m-2"
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABVElEQVR4nO2UvUoDQRSFv0BAWSL4AII/KEgKEVFfIKDY2dpIGn0XOyH+BRS11FY730As0sRSkfgA4hb+BIxcOAuDzq6bccscuDDMOXPu3TuzFwYIwCTQBDpAF3gGjoFpRzMDnIjrSnuks5lYBWKg54lPYAvY1tqneQVWsipPzK+AJSAC5oEL7X8pbH0pLpL22kky7kvQdMx92FTl1pJ6iiZJcugjOyIXM1q4oUjDsjyefOSHyArhqMjj3Uc+irS+hmJBHg8+8kBk4x8J9uVhXr8woU+zVlUDzGd13h7CVJqooQpugaE+zIeBuzwdsEtqS3gGlHKYm+ZcZ9p5HknV+eH2/khScvoe99PaGvCmg7sZuh1p7N7W6BPrzsyxP7PscGUNt2RGmTYINeBFRjfAKDDijIQ4pPKfmHPGyL2ipz3jCsEY0HLGckt7hSICThW2HoBC8A049mvhfQuirAAAAABJRU5ErkJggg=="
                            alt="filled-like"
                          ></img>
                        </button>
                        <div>
                          <img
                            src={markersData[item.properties.markerId - 1 ].image} // Use a placeholder image if item.image is not available
                            alt={item.info}
                            style={{ width: "100%", height: "200px", backgroundColor: "#f0f0f0" }} // Add a background color for visibility
                            onError={(e) => {
                              e.target.onerror = null; // Prevent infinite loop in case the placeholder image also fails
                              e.target.src = "https://via.placeholder.com/500x200"; // Fallback to placeholder image on error
                            }}
                          />{" "}
                        </div>
                        <div style={{ fontFamily: "Roboto" }} className="p-4">
                          <h1 className="font-bold text-lg text-[#222222]">{item.properties.info}</h1>
                          <h1 className="font-medium text-base text-[#6a6a6a]">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus, dicta...{" "}
                            <span
                              className="cursor-pointer text-sm text-[#4cacc7] font-bold hidden xl:flex"
                              onClick={() => {
                                setOpenModal(true);
                              }}
                            >
                              see more
                            </span>{" "}
                          </h1>
                          <div className="flex justify-between mt-4">
                            <p className="font-bold">$5000</p>
                            <p>26 Mar 2025</p>
                          </div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </AdvancedMarker>
              );
            })}
          </Map>
        </div>
      </div>
    </APIProvider>
  );
}
