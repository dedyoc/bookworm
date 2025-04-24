import { Separator } from "@/components/ui/separator";
import React from "react";

export const AboutPage: React.FC = () => {
    return (
        <>
            <h1 className="text-2xl font-bold">About Us</h1>
            <Separator className="my-4" />
            <div className="space-y-12 mx-50">
                <h1 className="text-3xl font-bold text-center">Welcome to Bookworm</h1>
                <p className="text-lg">
                    "Bookworm is an independent New York bookstore and language school with locations in Manhattan and Brooklyn. We specialize in travel books and language classes."
                </p>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Our Story</h2>
                        <p>
                            The name Bookworm was taken from the original name for New York International Airport, which was renamed JFK in December 1963.  
                        </p>
                        <p>
                        Our Manhattan store has just moved to the West Village. Our new location is 170 7th Avenue South, at the corner of Perry Street.
                        </p>
                        <p>
                            From March 2008 through May 2016, the store was located in the Flatiron District.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Our Vision</h2>
                        <p>
                            One of the last travel bookstores in the country, our Manhattan store carries a range of guidebooks (all 10% off) to suit the needs and tastes of every traveller and budget.
                        </p>
                        <p>
                            We believe that a novel or travelogue can be just as valuable a key to a place as any guidebook, and our well-read, well-travelled staff is happy to make reading recommendations for any traveller, book lover, or gift giver.
                        </p>
                    </div>
                </section>
            </div>
        </>

    );
    }