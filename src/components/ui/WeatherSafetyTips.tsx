import { useState } from "react";
import {
  Info,
  AlertTriangle,
  CloudLightning,
  Wind,
  Tornado,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const WeatherSafetyTips = () => {
  const [isOpen, setIsOpen] = useState(false);

  const safetyTips = [
    {
      disaster: "Floods",
      icon: <CloudLightning className="h-5 w-5 text-blue-600" />,
      tips: [
        "Move to higher ground immediately if there's a flash flood warning",
        "Don't walk, swim, or drive through flood waters",
        "Stay off bridges over fast-moving water",
        "Evacuate if told to do so, following recommended routes",
      ],
    },
    {
      disaster: "Storms & Lightning",
      icon: <CloudLightning className="h-5 w-5 text-yellow-600" />,
      tips: [
        "When thunder roars, go indoors",
        "Stay away from windows during severe storms",
        "Unplug electrical equipment before the storm arrives",
        "Avoid using corded phones, computers, and other electrical equipment",
      ],
    },
    {
      disaster: "Cyclones & Typhoons",
      icon: <Wind className="h-5 w-5 text-teal-600" />,
      tips: [
        "Secure your home - close storm shutters and bring outdoor furniture inside",
        "Turn refrigerator to coldest setting in case power goes out",
        "Follow evacuation orders from local officials",
        "Stay away from windows during the storm",
      ],
    },
    {
      disaster: "Extreme Heat",
      icon: <Tornado className="h-5 w-5 text-red-600" />,
      tips: [
        "Stay in air-conditioned buildings as much as possible",
        "Drink more water than usual",
        "Wear lightweight, light-colored clothing",
        "Check on elderly neighbors and those without air conditioning",
      ],
    },
  ];

  return (
    <div className="mb-8 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="px-6 py-4 flex items-center justify-between bg-amber-100/50 dark:bg-amber-900/30">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-bold">
              Safety Measures for Natural Disasters
            </h2>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? "Hide Tips" : "Show Tips"}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="p-6">
            <p className="mb-4 text-muted-foreground">
              Being prepared can save lives during natural disasters. Review
              these safety tips for common weather emergencies in Myanmar.
            </p>

            <Accordion type="single" collapsible className="w-full">
              {safetyTips.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="flex items-center gap-2 py-3">
                    <span className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.disaster}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-9 pt-2">
                      {item.tips.map((tip, tipIndex) => (
                        <li
                          key={tipIndex}
                          className="list-disc text-muted-foreground"
                        >
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-md flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm">
                These are general guidelines. Always follow instructions from
                local authorities during emergencies.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default WeatherSafetyTips;
