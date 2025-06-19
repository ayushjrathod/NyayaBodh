import {
  Accordion,
  AccordionItem,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  ScrollShadow,
  Skeleton,
} from "@nextui-org/react";
import axios from "axios";
import { Briefcase, Calendar, FileText, Gavel, MapPin, Scale, Users } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiConfig } from "../../config/api";

const Recommend = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { uuid } = useParams();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(apiConfig.endpoints.recommend(uuid));
        if (response.data) {
          setData(response.data);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to load recommendations");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [uuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-96 rounded-xl" />
            </div>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="bg-red-900/50 border border-red-500/50">
          <CardBody className="text-center p-8">
            <div className="text-red-400 text-lg font-semibold">{error}</div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="bg-gray-800/50 border border-gray-600/50">
          <CardBody className="text-center p-8">
            <div className="text-gray-300 text-lg">No data available</div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { target_case, recommended_cases } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary-500 mb-2">Case Recommendation System</h1>
          <p className="text-gray-300 text-lg">Target case analysis with similar case recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Target Case - Left Column */}
          <div className="lg:col-span-1">
            <TargetCaseCard targetCase={target_case} />
          </div>

          {/* Recommended Cases - Right Column */}
          <div className="lg:col-span-2">
            <RecommendedCasesSection cases={recommended_cases} />
          </div>
        </div>
      </div>
    </div>
  );
};

const TargetCaseCard = ({ targetCase }) => {
  return (
    <Card className="bg-gray-800/60 border border-primary-500/30 backdrop-blur-lg sticky top-6">
      <CardHeader className="bg-gradient-to-r from-primary-500/20 to-primary-400/20 border-b border-primary-500/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Scale className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary-400">Target Case</h2>
            <p className="text-sm text-gray-400">Primary case for analysis</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <ScrollShadow className="max-h-[600px]">
          <div className="space-y-4">
            <CaseBasicInfo caseData={targetCase} />
            <Divider className="bg-gray-600/50" />
            <CaseDetailsAccordion caseData={targetCase} />
            {targetCase?.summary && (
              <>
                <Divider className="bg-gray-600/50" />
                <div>
                  <h4 className="font-semibold text-primary-400 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Case Summary
                  </h4>
                  <ScrollShadow className="max-h-48">
                    <p className="text-sm text-gray-300 leading-relaxed">{targetCase.summary}</p>
                  </ScrollShadow>
                </div>
              </>
            )}
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
};

TargetCaseCard.propTypes = {
  targetCase: PropTypes.object.isRequired,
};

const RecommendedCasesSection = ({ cases }) => {
  if (!cases || !Array.isArray(cases) || cases.length === 0) {
    return (
      <Card className="bg-gray-800/60 border border-gray-600/50">
        <CardBody className="text-center py-12">
          <div className="text-gray-400 text-lg">No recommended cases found</div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-400 flex items-center gap-3">
          <Briefcase className="w-7 h-7" />
          Recommended Cases
        </h2>
        <Badge content={cases.length} color="primary" variant="solid">
          <div className="text-sm text-gray-400">Total Matches</div>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cases.map((case_, index) => (
          <RecommendedCaseCard key={case_.uuid || index} recommendedCase={case_} rank={index + 1} />
        ))}
      </div>
    </div>
  );
};

RecommendedCasesSection.propTypes = {
  cases: PropTypes.array,
};

const RecommendedCaseCard = ({ recommendedCase, rank }) => {
  return (
    <Card className="bg-gray-800/60 border border-gray-600/50 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-center gap-3">
            <Badge content={rank} color="primary" placement="top-left" className="p-0">
              <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary-400">#{rank}</span>
              </div>
            </Badge>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">{recommendedCase?.CASE_NUMBER || "N/A"}</h3>
              <p className="text-xs text-gray-400 mt-1">{recommendedCase?.file_name || "Unknown file"}</p>
            </div>
          </div>
          <Chip color="primary" variant="flat" size="sm" className="bg-primary-500/20 text-primary-300">
            {recommendedCase?.similarity?.toFixed(1) || "N/A"}% Match
          </Chip>
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <ScrollShadow className="max-h-64">
          <div className="space-y-3">
            <CaseBasicInfo caseData={recommendedCase} isCompact />
            <Divider className="bg-gray-600/30" />
            <CaseDetailsAccordion caseData={recommendedCase} isCompact />
            {recommendedCase?.summary && (
              <>
                <Divider className="bg-gray-600/30" />
                <div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {recommendedCase.summary.substring(0, 200)}...
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
};

RecommendedCaseCard.propTypes = {
  recommendedCase: PropTypes.object.isRequired,
  rank: PropTypes.number.isRequired,
};

const CaseBasicInfo = ({ caseData, isCompact = false }) => {
  const iconSize = isCompact ? "w-3 h-3" : "w-4 h-4";
  const textSize = isCompact ? "text-xs" : "text-sm";
  const labelSize = isCompact ? "text-xs" : "text-sm";

  return (
    <div className="space-y-2">
      <InfoItem
        icon={<Gavel className={iconSize} />}
        label="Court"
        value={caseData?.COURT}
        textSize={textSize}
        labelSize={labelSize}
      />
      <InfoItem
        icon={<Calendar className={iconSize} />}
        label="Date"
        value={caseData?.DATE}
        textSize={textSize}
        labelSize={labelSize}
      />
      <InfoItem
        icon={<Users className={iconSize} />}
        label="Judge"
        value={caseData?.JUDGE}
        textSize={textSize}
        labelSize={labelSize}
        maxLength={isCompact ? 50 : 100}
      />
      <InfoItem
        icon={<MapPin className={iconSize} />}
        label="Location"
        value={caseData?.GPE}
        textSize={textSize}
        labelSize={labelSize}
        maxLength={isCompact ? 30 : 60}
      />
    </div>
  );
};

CaseBasicInfo.propTypes = {
  caseData: PropTypes.object,
  isCompact: PropTypes.bool,
};

const CaseDetailsAccordion = ({ caseData, isCompact = false }) => {
  const textSize = isCompact ? "text-xs" : "text-sm";

  return (
    <Accordion variant="splitted" className="p-0">
      <AccordionItem
        key="parties"
        aria-label="Parties Involved"
        title={<span className={`${textSize} font-semibold text-primary-400`}>Parties Involved</span>}
        className="bg-gray-700/30"
      >
        <div className="space-y-2 pb-2">
          <InfoItem
            label="Petitioner"
            value={caseData?.PETITIONER}
            textSize={textSize}
            maxLength={isCompact ? 60 : 120}
          />
          <InfoItem
            label="Respondent"
            value={caseData?.RESPONDENT}
            textSize={textSize}
            maxLength={isCompact ? 60 : 120}
          />
          <InfoItem label="Lawyer" value={caseData?.LAWYER} textSize={textSize} maxLength={isCompact ? 40 : 80} />
        </div>
      </AccordionItem>

      <AccordionItem
        key="legal"
        aria-label="Legal Information"
        title={<span className={`${textSize} font-semibold text-primary-400`}>Legal Information</span>}
        className="bg-gray-700/30"
      >
        <div className="space-y-2 pb-2">
          <InfoItem label="Statute" value={caseData?.STATUTE} textSize={textSize} maxLength={isCompact ? 60 : 120} />
          <InfoItem
            label="Provision"
            value={caseData?.PROVISION}
            textSize={textSize}
            maxLength={isCompact ? 60 : 120}
          />
          <InfoItem
            label="Precedent"
            value={caseData?.PRECEDENT}
            textSize={textSize}
            maxLength={isCompact ? 80 : 150}
          />
        </div>
      </AccordionItem>
    </Accordion>
  );
};

CaseDetailsAccordion.propTypes = {
  caseData: PropTypes.object,
  isCompact: PropTypes.bool,
};

const InfoItem = ({ icon, label, value, textSize = "text-sm", labelSize = "text-sm", maxLength = 100 }) => {
  if (!value || value === "null" || value === "N/A") return null;

  const displayValue =
    typeof value === "string" && value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;

  return (
    <div className="flex items-start gap-2">
      {icon && <div className="mt-1 text-primary-400 flex-shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className={`${labelSize} font-semibold text-primary-400`}>{label}:</p>
        <p className={`${textSize} text-gray-300 break-words`}>{displayValue}</p>
      </div>
    </div>
  );
};

InfoItem.propTypes = {
  icon: PropTypes.element,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  textSize: PropTypes.string,
  labelSize: PropTypes.string,
  maxLength: PropTypes.number,
};

export default Recommend;
