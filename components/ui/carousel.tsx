"use client";

import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  createContext,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  ref,
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & CarouselProps & { ref?: Ref<HTMLElement> }) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) {
      return;
    }

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = () => {
    api?.scrollPrev();
  };

  const scrollNext = () => {
    api?.scrollNext();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  };

  useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

  useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <section
        className={cn("relative", className)}
        onKeyDownCapture={handleKeyDown}
        ref={ref}
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}
Carousel.displayName = "Carousel";

function CarouselContent({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div className="overflow-hidden" ref={carouselRef}>
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
}
CarouselContent.displayName = "CarouselContent";

function CarouselItem({
  ref,
  className,
  ...props
}: HTMLAttributes<HTMLFieldSetElement> & { ref?: Ref<HTMLFieldSetElement> }) {
  const { orientation } = useCarousel();

  return (
    <fieldset
      aria-roledescription="slide"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full border-0 p-0",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}
CarouselItem.displayName = "CarouselItem";

function CarouselPrevious({
  ref,
  className,
  variant = "outline",
  size = "icon",
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-left-12 -translate-y-1/2 top-1/2"
          : "-top-12 -translate-x-1/2 left-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      ref={ref}
      size={size}
      variant={variant}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}
CarouselPrevious.displayName = "CarouselPrevious";

function CarouselNext({
  ref,
  className,
  variant = "outline",
  size = "icon",
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      className={cn(
        "absolute h-8 w-8 rounded-full",
        orientation === "horizontal"
          ? "-right-12 -translate-y-1/2 top-1/2"
          : "-bottom-12 -translate-x-1/2 left-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      ref={ref}
      size={size}
      variant={variant}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}
CarouselNext.displayName = "CarouselNext";

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
