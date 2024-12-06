import { Button, Card, CardBody, CardFooter } from "@nextui-org/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import data from "../../assets/features.json";

const SelectionPage = () => {
  const [showMore, setShowMore] = useState({});

  const toggleShowMore = (id) => {
    setShowMore((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full">
              <CardBody>
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                <p className="">{showMore[item.id] ? item.description : `${item.description.substring(0, 100)}...`}</p>
                <Button
                  color="primary"
                  variant="light"
                  size="sm"
                  onClick={() => toggleShowMore(item.id)}
                  className="mt-2"
                >
                  {showMore[item.id] ? "Show Less" : "Show More"}
                </Button>
              </CardBody>
              <CardFooter>
                <Button as={Link} to={`/docgen/${item.shortName}`} color="primary" className="w-full">
                  Generate
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SelectionPage;
