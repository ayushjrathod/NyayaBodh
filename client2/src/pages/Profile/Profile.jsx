import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Button,
  Input,
  Textarea,
  Switch,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Chip,
  Divider,
  Progress,
  Badge,
} from "@nextui-org/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Activity,
  Shield,
  Bell,
  Globe,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Award,
  Clock,
  FileText,
  MessageSquare,
  Search,
  Gavel,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast, ValidatedInput, validationRules, SkeletonLoader } from "../../components/ui";

const Profile = () => {
  const { toast } = useToast();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Mock user data - replace with actual data from your auth system
  const [userData, setUserData] = useState({
    id: "user_123",
    fullname: "Dr. Sarah Johnson",
    email: "sarah.johnson@lawfirm.com",
    phone: "+1 (555) 123-4567",
    title: "Senior Legal Counsel",
    bio: "Experienced legal professional specializing in corporate law and intellectual property rights with over 10 years of practice.",
    location: "New York, NY",
    joinDate: "2022-03-15",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    role: "LAWYER",
    stats: {
      casesHandled: 156,
      documentsReviewed: 2340,
      consultationsGiven: 89,
      successRate: 94,
    },
    preferences: {
      notifications: {
        email: true,
        push: false,
        sms: true,
        marketing: false,
      },
      privacy: {
        profileVisible: true,
        showActivity: false,
        showStats: true,
      },
      language: "en",
      timezone: "America/New_York",
      theme: "system",
    },
    connectedAccounts: [
      { platform: "Google", connected: true, email: "sarah.j@gmail.com" },
      { platform: "LinkedIn", connected: true, username: "@sarahjohnsonlaw" },
      { platform: "Microsoft", connected: false, email: null },
    ],
    recentActivity: [
      { type: "search", description: "Searched for contract law precedents", timestamp: "2024-01-15T10:30:00Z" },
      { type: "document", description: "Reviewed merger agreement document", timestamp: "2024-01-15T09:15:00Z" },
      { type: "consultation", description: "Provided legal consultation on IP rights", timestamp: "2024-01-14T16:45:00Z" },
      { type: "case", description: "Updated case status for Johnson v. Smith", timestamp: "2024-01-14T14:20:00Z" },
    ],
  });

  const [formData, setFormData] = useState({ ...userData });

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...userData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...userData });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUserData({ ...formData });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [category]: {
          ...prev.preferences[category],
          [field]: value,
        },
      },
    }));
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "danger",
      LAWYER: "primary",
      JUDGE: "secondary",
      CLERK: "warning",
      USER: "default",
    };
    return colors[role] || "default";
  };

  const getActivityIcon = (type) => {
    const icons = {
      search: Search,
      document: FileText,
      consultation: MessageSquare,
      case: Gavel,
    };
    return icons[type] || Activity;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <SkeletonLoader type="card" count={1} className="h-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonLoader type="card" count={2} />
            <SkeletonLoader type="card" count={1} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 font-inter">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="card-enhanced">
            <CardBody className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar Section */}
                <div className="relative">
                  <Badge
                    content={<Camera className="w-3 h-3" />}
                    color="primary"
                    placement="bottom-right"
                    className="cursor-pointer"
                  >
                    <Avatar
                      src={userData.avatar}
                      name={userData.fullname}
                      className="w-24 h-24 md:w-32 md:h-32 text-large"
                      isBordered
                      color="primary"
                    />
                  </Badge>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground hierarchy-2">
                      {userData.fullname}
                    </h1>
                    <Chip color={getRoleColor(userData.role)} variant="flat" size="sm">
                      {userData.role}
                    </Chip>
                  </div>
                  
                  <p className="text-lg text-primary font-medium">{userData.title}</p>
                  <p className="text-default-600 leading-relaxed max-w-2xl">{userData.bio}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-default-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {userData.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(userData.joinDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      color="primary"
                      variant="flat"
                      startContent={<Edit3 className="w-4 h-4" />}
                      onClick={handleEdit}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        color="success"
                        startContent={<Save className="w-4 h-4" />}
                        onClick={handleSave}
                        isLoading={isSaving}
                      >
                        Save
                      </Button>
                      <Button
                        color="danger"
                        variant="flat"
                        startContent={<X className="w-4 h-4" />}
                        onClick={handleCancel}
                        isDisabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Section */}
              <Divider className="my-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(userData.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {typeof value === 'number' && key === 'successRate' ? `${value}%` : value}
                    </div>
                    <div className="text-sm text-default-500 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={setActiveTab}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary"
            }}
          >
            <Tab
              key="personal"
              title={
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </div>
              }
            >
              <PersonalInfoTab
                userData={userData}
                formData={formData}
                isEditing={isEditing}
                onInputChange={handleInputChange}
              />
            </Tab>

            <Tab
              key="activity"
              title={
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity History
                </div>
              }
            >
              <ActivityTab userData={userData} getActivityIcon={getActivityIcon} />
            </Tab>

            <Tab
              key="preferences"
              title={
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Preferences
                </div>
              }
            >
              <PreferencesTab
                userData={userData}
                formData={formData}
                onPreferenceChange={handlePreferenceChange}
                onSave={handleSave}
                isSaving={isSaving}
              />
            </Tab>

            <Tab
              key="accounts"
              title={
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Connected Accounts
                </div>
              }
            >
              <ConnectedAccountsTab userData={userData} />
            </Tab>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

// Personal Information Tab Component
const PersonalInfoTab = ({ userData, formData, isEditing, onInputChange }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="mt-6"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-enhanced">
        <CardHeader>
          <h3 className="text-lg font-semibold">Basic Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          {isEditing ? (
            <>
              <ValidatedInput
                label="Full Name"
                value={formData.fullname}
                onChange={(e) => onInputChange('fullname', e.target.value)}
                validation={validationRules.required}
                startContent={<User className="w-4 h-4 text-default-400" />}
              />
              <ValidatedInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => onInputChange('email', e.target.value)}
                validation={validationRules.email}
                startContent={<Mail className="w-4 h-4 text-default-400" />}
              />
              <ValidatedInput
                label="Phone"
                value={formData.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                validation={validationRules.phone}
                startContent={<Phone className="w-4 h-4 text-default-400" />}
              />
              <ValidatedInput
                label="Job Title"
                value={formData.title}
                onChange={(e) => onInputChange('title', e.target.value)}
                validation={validationRules.required}
                startContent={<Award className="w-4 h-4 text-default-400" />}
              />
            </>
          ) : (
            <>
              <InfoField icon={User} label="Full Name" value={userData.fullname} />
              <InfoField icon={Mail} label="Email" value={userData.email} />
              <InfoField icon={Phone} label="Phone" value={userData.phone} />
              <InfoField icon={Award} label="Job Title" value={userData.title} />
            </>
          )}
        </CardBody>
      </Card>

      <Card className="card-enhanced">
        <CardHeader>
          <h3 className="text-lg font-semibold">Additional Details</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          {isEditing ? (
            <>
              <ValidatedInput
                label="Location"
                value={formData.location}
                onChange={(e) => onInputChange('location', e.target.value)}
                startContent={<MapPin className="w-4 h-4 text-default-400" />}
              />
              <Textarea
                label="Bio"
                value={formData.bio}
                onChange={(e) => onInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                minRows={3}
                maxRows={5}
              />
            </>
          ) : (
            <>
              <InfoField icon={MapPin} label="Location" value={userData.location} />
              <InfoField icon={FileText} label="Bio" value={userData.bio} multiline />
              <InfoField icon={Calendar} label="Member Since" value={new Date(userData.joinDate).toLocaleDateString()} />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  </motion.div>
);

// Activity History Tab Component
const ActivityTab = ({ userData, getActivityIcon }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="mt-6"
  >
    <Card className="card-enhanced">
      <CardHeader>
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {userData.recentActivity.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-default-50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <p className="text-xs text-default-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  </motion.div>
);

// Preferences Tab Component
const PreferencesTab = ({ userData, formData, onPreferenceChange, onSave, isSaving }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="mt-6"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-enhanced">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          {Object.entries(formData.preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <Switch
                isSelected={value}
                onValueChange={(checked) => onPreferenceChange('notifications', key, checked)}
                color="primary"
              />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card className="card-enhanced">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          {Object.entries(formData.preferences.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <Switch
                isSelected={value}
                onValueChange={(checked) => onPreferenceChange('privacy', key, checked)}
                color="primary"
              />
            </div>
          ))}
        </CardBody>
      </Card>

      <Card className="card-enhanced lg:col-span-2">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            General Settings
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Language"
              selectedKeys={[formData.preferences.language]}
              onSelectionChange={(keys) => onPreferenceChange('general', 'language', Array.from(keys)[0])}
            >
              <SelectItem key="en" value="en">English</SelectItem>
              <SelectItem key="es" value="es">Spanish</SelectItem>
              <SelectItem key="fr" value="fr">French</SelectItem>
            </Select>
            
            <Select
              label="Timezone"
              selectedKeys={[formData.preferences.timezone]}
              onSelectionChange={(keys) => onPreferenceChange('general', 'timezone', Array.from(keys)[0])}
            >
              <SelectItem key="America/New_York" value="America/New_York">Eastern Time</SelectItem>
              <SelectItem key="America/Chicago" value="America/Chicago">Central Time</SelectItem>
              <SelectItem key="America/Denver" value="America/Denver">Mountain Time</SelectItem>
              <SelectItem key="America/Los_Angeles" value="America/Los_Angeles">Pacific Time</SelectItem>
            </Select>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button
              color="primary"
              onClick={onSave}
              isLoading={isSaving}
              startContent={<Save className="w-4 h-4" />}
            >
              Save Preferences
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  </motion.div>
);

// Connected Accounts Tab Component
const ConnectedAccountsTab = ({ userData }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="mt-6"
  >
    <Card className="card-enhanced">
      <CardHeader>
        <h3 className="text-lg font-semibold">Connected Accounts</h3>
        <p className="text-sm text-default-500">Manage your connected social and professional accounts</p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {userData.connectedAccounts.map((account, index) => (
            <motion.div
              key={account.platform}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-default-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-default-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium">{account.platform[0]}</span>
                </div>
                <div>
                  <p className="font-medium">{account.platform}</p>
                  <p className="text-sm text-default-500">
                    {account.connected ? (account.email || account.username) : 'Not connected'}
                  </p>
                </div>
              </div>
              <Button
                color={account.connected ? "danger" : "primary"}
                variant={account.connected ? "flat" : "solid"}
                size="sm"
              >
                {account.connected ? 'Disconnect' : 'Connect'}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  </motion.div>
);

// Helper component for displaying information fields
const InfoField = ({ icon: Icon, label, value, multiline = false }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-default-400 mt-1 flex-shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-default-600">{label}</p>
      <p className={`text-sm text-foreground ${multiline ? 'leading-relaxed' : ''}`}>
        {value}
      </p>
    </div>
  </div>
);

export default Profile;