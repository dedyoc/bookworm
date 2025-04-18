import React from "react";
// a. Welcome part: 
// Bookworm is an independent New York bookstore and language school with locations in 
// Manhattan and Brooklyn. We specialize in travel books and language classes. 
// b. Our story part: 
// The name Bookworm was taken from the original name for New York International Airport, 
// which was renamed JFK in December 1963. 
// Our Manhattan store has just moved to the West Village. Our new location is 170 7th Avenue 
// South, at the corner of Perry Street. 
// From March 2008 through May 2016, the store was located in the Flatiron District. 
// c. Our vision part: 
// One of the last travel bookstores in the country, our Manhattan store carries a range of 
// guidebooks (all 10% off) to suit the needs and tastes of every traveller and budget. 
// We believe that a novel or travelogue can be just as valuable a key to a place as any guidebook, 
// and our well-read, well-travelled staff is happy to make reading recommendations for any 
// traveller, book lover, or gift giver.
// Welcome part: in a normal block
// Our story part and Our vision part: in side by side blocks same row.

export const AboutPage: React.FC = () => {
    return (
        <div className="container mx-auto mt-10 px-4">
            <h1 className="text-3xl font-bold mb-6">About Bookworm</h1>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Welcome to Bookworm!</h2>
                <p>
                    Bookworm is an independent New York bookstore and language school with locations in Manhattan and Brooklyn. We specialize in travel books and language classes.
                </p>            
            </div>
            </div>
    );
    }