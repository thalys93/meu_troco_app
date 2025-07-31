import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button } from "./ui/button";

export type imagesProps = {
    image: string;
    description: string;
}
interface CarouselProps {
    images: imagesProps[];
}

export default function CarouselWithThumbs({ images }: CarouselProps) {
    const [api, setApi] = React.useState<CarouselApi>();
    const [current, setCurrent] = React.useState(0);
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
        if (!api) {
            return;
        }
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);
    const handleThumbClick = React.useCallback(
        (index: number) => {
            api?.scrollTo(index);
        },
        [api]
    );
    return (
        <div className="mx-auto max-w-xl">
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {images?.map((img, index) => (
                        <CarouselItem key={index}>
                            <img src={img.image} alt={img.description} className="object-cover transition-all hover:scale-125" />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            <Carousel className="mt-4 w-full max-w-xl">
                <CarouselContent className="flex my-1">
                    {images?.map((img, index) => (
                        <CarouselItem
                            key={index}
                            className={cn(
                                "basis-1/5 cursor-pointer",
                                current === index + 1 ? "opacity-100" : "opacity-50"
                            )}
                            onClick={() => handleThumbClick(index)}
                        >
                            <Button className="h-full w-full mx-3">
                                <span>{img.description}</span>
                            </Button>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}