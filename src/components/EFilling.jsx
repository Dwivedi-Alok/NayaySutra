import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// State-District Mapping
const STATE_DISTRICT_MAPPING = {
  andhra_pradesh: {
    name: 'Andhra Pradesh',
    districts: ['Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla', 'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'Nellore', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam', 'Srikakulam', 'Sri Satya Sai', 'Tirupati', 'Visakhapatnam', 'Vizianagaram', 'West Godavari', 'YSR Kadapa']
  },
  arunachal_pradesh: {
    name: 'Arunachal Pradesh',
    districts: ['Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Lepa Rada', 'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke-Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang', 'Tirap', 'Upper Dibang Valley', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang']
  },
  assam: {
    name: 'Assam',
    districts: ['Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar', 'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong']
  },
  bihar: {
    name: 'Bihar',
    districts: ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran']
  },
  chhattisgarh: {
    name: 'Chhattisgarh',
    districts: ['Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Dakshin Bastar Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sukma', 'Surajpur', 'Surguja']
  },
  goa: {
    name: 'Goa',
    districts: ['North Goa', 'South Goa']
  },
  gujarat: {
    name: 'Gujarat',
    districts: ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad']
  },
  haryana: {
    name: 'Haryana',
    districts: ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar']
  },
  himachal_pradesh: {
    name: 'Himachal Pradesh',
    districts: ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una']
  },
  jharkhand: {
    name: 'Jharkhand',
    districts: ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela-Kharsawan', 'Simdega', 'West Singhbhum']
  },
  karnataka: {
    name: 'Karnataka',
    districts: ['Bagalkot', 'Bangalore Rural', 'Bangalore Urban', 'Belagavi', 'Bellary', 'Bidar', 'Vijayapura', 'Chamarajanagara', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Kalaburagi', 'Hassan', 'Haveri', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayanagara', 'Yadgir']
  },
  kerala: {
    name: 'Kerala',
    districts: ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad']
  },
  madhya_pradesh: {
    name: 'Madhya Pradesh',
    districts: ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha']
  },
  maharashtra: {
    name: 'Maharashtra',
    districts: ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal']
  },
  manipur: {
    name: 'Manipur',
    districts: ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul']
  },
  meghalaya: {
    name: 'Meghalaya',
    districts: ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'Mairang', 'North Garo Hills', 'Ri-Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills']
  },
  mizoram: {
    name: 'Mizoram',
    districts: ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip']
  },
  nagaland: {
    name: 'Nagaland',
    districts: ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Noklak', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto']
  },
  odisha: {
    name: 'Odisha',
    districts: ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh']
  },
  punjab: {
    name: 'Punjab',
    districts: ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Malerkotla', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur', 'SAS Nagar', 'SBS Nagar', 'Sri Muktsar Sahib', 'Tarn Taran']
  },
  rajasthan: {
    name: 'Rajasthan',
    districts: ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Ganganagar', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Tonk', 'Udaipur']
  },
  sikkim: {
    name: 'Sikkim',
    districts: ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim']
  },
  tamil_nadu: {
    name: 'Tamil Nadu',
    districts: ['Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thiruvallur', 'Thiruvarur', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvannamalai', 'Vellore', 'Viluppuram', 'Virudhunagar']
  },
  telangana: {
    name: 'Telangana',
    districts: ['Adilabad', 'Bhadradri Kothagudem', 'Hanamkonda', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalapally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal–Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri']
  },
  tripura: {
    name: 'Tripura',
    districts: ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura']
  },
  uttar_pradesh: {
    name: 'Uttar Pradesh',
    districts: ['Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh', 'Badaun', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar', 'Lakhimpur', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi']
  },
  uttarakhand: {
    name: 'Uttarakhand',
    districts: ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi']
  },
  west_bengal: {
    name: 'West Bengal',
    districts: ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur']
  },
  // Union Territories
  andaman_and_nicobar_islands: {
    name: 'Andaman and Nicobar Islands',
    districts: ['Nicobar', 'North and Middle Andaman', 'South Andaman']
  },
  chandigarh: {
    name: 'Chandigarh',
    districts: ['Chandigarh']
  },
  dadra_and_nagar_haveli_and_daman_and_diu: {
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    districts: ['Dadra and Nagar Haveli', 'Daman', 'Diu']
  },
  lakshadweep: {
    name: 'Lakshadweep',
    districts: ['Lakshadweep']
  },
  delhi: {
    name: 'Delhi',
    districts: ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi']
  },
  puducherry: {
    name: 'Puducherry',
    districts: ['Karaikal', 'Mahe', 'Puducherry', 'Yanam']
  },
  jammu_and_kashmir: {
    name: 'Jammu and Kashmir',
    districts: ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur']
  },
  ladakh: {
    name: 'Ladakh',
    districts: ['Kargil', 'Leh']
  }
};

const EFiling = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [userType, setUserType] = useState('');
  const [formData, setFormData] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [dashboardView, setDashboardView] = useState('overview');

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Login Component
  const LoginScreen = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4"
      >
        <div className="max-w-md w-full">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                <span className="text-3xl text-white">⚖️</span>
              </div>
              <h1 className="text-3xl font-bold text-black">e-Filing Portal</h1>
              <p className="text-black mt-2">High Courts & District Courts</p>
            </div>

            {/* Login Form */}
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter your User ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Forgot Username?
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsLoggedIn(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
              >
                Login
              </button>

              <div className="text-center">
                <span className="text-black">New to Website? </span>
                <button
                  type="button"
                  onClick={() => setShowRegistration(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Registration Component with State-District Mapping
  const RegistrationScreen = () => {
    const [registrationType, setRegistrationType] = useState('');
    const [registrationData, setRegistrationData] = useState({
      mobile: '',
      email: '',
      barNumber: '',
      userId: '',
      state: '',
      district: '',
      establishment: ''
    });
    const [availableDistricts, setAvailableDistricts] = useState([]);

    // Update districts when state changes
    useEffect(() => {
      if (registrationData.state) {
        const stateData = STATE_DISTRICT_MAPPING[registrationData.state];
        if (stateData) {
          setAvailableDistricts(stateData.districts);
          setRegistrationData(prev => ({ ...prev, district: '' })); // Reset district selection
        }
      } else {
        setAvailableDistricts([]);
      }
    }, [registrationData.state]);

    const handleStateChange = (e) => {
      setRegistrationData(prev => ({ ...prev, state: e.target.value }));
    };

    const handleDistrictChange = (e) => {
      setRegistrationData(prev => ({ ...prev, district: e.target.value }));
    };

    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-black">User Registration</h2>

            {!registrationType ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4 text-black">Select Registration Type</h3>
                {[
                  { type: 'advocate', label: 'Advocate', icon: '⚖️' },
                                   { type: 'party', label: 'Party-in-Person', icon: '👤' },
                  { type: 'police', label: 'Police Station', icon: '👮' }
                ].map((option) => (
                  <motion.button
                    key={option.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRegistrationType(option.type)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-4"
                  >
                    <span className="text-3xl">{option.icon}</span>
                    <span className="font-semibold text-black">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setRegistrationType('')}
                  className="text-blue-600 hover:text-blue-700 mb-4"
                >
                  ← Back
                </button>

                <h3 className="text-lg font-semibold mb-4 text-black">
                  Registration as {registrationType === 'advocate' ? 'Advocate' : 
                                 registrationType === 'party' ? 'Party-in-Person' : 'Police Station'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      value={registrationData.mobile}
                      onChange={(e) => setRegistrationData({...registrationData, mobile: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Enter mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Email ID *
                    </label>
                    <input
                      type="email"
                      value={registrationData.email}
                      onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Enter email address"
                    />
                  </div>

                  {registrationType === 'advocate' && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Bar Registration Number *
                      </label>
                      <input
                        type="text"
                        value={registrationData.barNumber}
                        onChange={(e) => setRegistrationData({...registrationData, barNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Enter bar registration number"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      User ID *
                    </label>
                    <input
                      type="text"
                      value={registrationData.userId}
                      onChange={(e) => setRegistrationData({...registrationData, userId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Choose a user ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      State *
                    </label>
                    <select 
                      value={registrationData.state}
                      onChange={handleStateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="">Select State</option>
                      {Object.entries(STATE_DISTRICT_MAPPING).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      District *
                    </label>
                    <select 
                      value={registrationData.district}
                      onChange={handleDistrictChange}
                      disabled={!registrationData.state}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100"
                    >
                      <option value="">Select District</option>
                      {availableDistricts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">
                      Court Establishment
                    </label>
                    <select 
                      value={registrationData.establishment}
                      onChange={(e) => setRegistrationData({...registrationData, establishment: e.target.value})}
                      disabled={!registrationData.district}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black disabled:bg-gray-100"
                    >
                      <option value="">Select Court Establishment</option>
                      {registrationData.district && (
                        <>
                          <option value="high-court">High Court</option>
                          <option value="district-court">District Court</option>
                          <option value="sessions-court">Sessions Court</option>
                          <option value="magistrate-court">Magistrate Court</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-black mb-3">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-black mb-1">
                        Address *
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                        rows="3"
                        placeholder="Enter your complete address"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setOtpSent(true)}
                  disabled={!registrationData.state || !registrationData.district || !registrationData.mobile || !registrationData.email}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get OTP
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const [selectedCase, setSelectedCase] = useState(null);
    const [activeSection, setActiveSection] = useState('home');

    const menuItems = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'newCase', label: 'New Case', icon: '📋' },
      { id: 'documents', label: 'Documents', icon: '📄' },
      { id: 'deficitFees', label: 'Deficit Court Fee', icon: '💰' },
      { id: 'reports', label: 'Reports', icon: '📊' },
      { id: 'help', label: 'Help', icon: '❓' }
    ];

    const statusCards = [
      { title: 'Drafts', count: 3, color: 'bg-gray-500' },
      { title: 'Pending Acceptance', count: 2, color: 'bg-yellow-500' },
      { title: 'Not Accepted', count: 1, color: 'bg-red-500' },
      { title: 'Deficit Court Fees', count: 0, color: 'bg-orange-500' },
      { title: 'Pending Scrutiny', count: 4, color: 'bg-blue-500' },
      { title: 'Defective Cases', count: 1, color: 'bg-purple-500' }
    ];

    // Add Home Dashboard Content
    const HomeDashboard = () => (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome back, Advocate!</h2>
              <p className="text-blue-100">Ready to manage your legal cases efficiently</p>
            </div>
            <div className="text-6xl opacity-20">⚖️</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveSection('newCase')}
            className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-semibold text-black">File New Case</h3>
            <p className="text-sm text-black mt-1">Start a new case filing</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveSection('documents')}
            className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all"
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="font-semibold text-black">Upload Documents</h3>
            <p className="text-sm text-black mt-1">File miscellaneous documents</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all"
          >
                        <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-black">Track Case</h3>
            <p className="text-sm text-black mt-1">Check case status</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveSection('reports')}
            className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-all"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-semibold text-black">Reports</h3>
            <p className="text-sm text-black mt-1">Generate reports</p>
          </motion.button>
        </div>

        {/* Status Overview */}
        <div>
          <h2 className="text-xl text-black font-bold mb-4">My e-Filing Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statusCards.map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center mb-3`}>
                  <span className="text-white font-bold">{card.count}</span>
                </div>
                <h3 className="text-sm font-medium text-black">{card.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Cases */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg text-black font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Recent Cases
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div>
                    <p className="font-medium text-black">EF/2024/00{idx + 1}</p>
                    <p className="text-sm text-black">State vs John Doe</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Filed
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              View All Cases
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg text-black font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">🔔</span>
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="font-medium text-blue-800">Case Update</p>
                <p className="text-sm text-black">Next hearing scheduled for Case EF/2024/001</p>
                <p className="text-xs text-black mt-1">2 hours ago</p>
              </div>
              <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="font-medium text-green-800">Payment Confirmed</p>
                <p className="text-sm text-black">Court fees payment successful for Case EF/2024/002</p>
                <p className="text-xs text-black mt-1">1 day ago</p>
              </div>
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="font-medium text-yellow-800">Document Required</p>
                <p className="text-sm text-black">Additional affidavit needed for Case EF/2024/003</p>
                <p className="text-xs text-black mt-1">2 days ago</p>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              View All Notifications
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg text-black font-bold mb-4">Your Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="text-sm text-black">Total Cases Filed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">8</div>
              <div className="text-sm text-black">Cases Resolved</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">₹25,000</div>
              <div className="text-sm text-black">Total Fees Paid</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">45</div>
              <div className="text-sm text-black">Documents Filed</div>
            </div>
          </div>
        </div>
      </motion.div>
    );

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-xl text-white">⚖️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">e-Filing Dashboard</h1>
                <p className="text-sm text-black">Welcome, Advocate</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-black hover:text-gray-700 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="px-4 py-2 text-sm font-medium text-black hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white h-screen shadow-lg">
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-black hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'home' && <HomeDashboard />}
            {activeSection === 'newCase' && <NewCaseFiling />}
            {activeSection === 'documents' && <DocumentFiling />}
            {activeSection === 'deficitFees' && <DeficitCourtFees />}
            {activeSection === 'reports' && <Reports />}
            {activeSection === 'help' && <HelpSupport />}
          </main>
        </div>
      </div>
    );
  };

  // New Case Filing Component
  const NewCaseFiling = () => {
    const [step, setStep] = useState(1);
    const [caseData, setCaseData] = useState({
      state: '',
      district: '',
      court: '',
      caseType: '',
      signingMethod: ''
    });

    const steps = [
      { id: 1, title: 'Where to File', icon: '📍' },
      { id: 2, title: 'Petitioner Details', icon: '👤' },
      { id: 3, title: 'Respondent Details', icon: '👥' },
      { id: 4, title: 'Case Information', icon: '📋' },
      { id: 5, title: 'Upload Documents', icon: '📄' },
      { id: 6, title: 'Pay Court Fees', icon: '💰' },
      { id: 7, title: 'Review & Submit', icon: '✅' }
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex flex-col items-center ${idx !== steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    step >= s.id ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {s.icon}
                  </div>
                  <span className={`text-xs mt-2 ${step >= s.id ? 'text-blue-600 font-semibold' : 'text-black'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 w-full mx-2 ${step > s.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg text-black font-semibold mb-4">Where to File</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">State *</label>
                  <select className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select State</option>
                    <option value="delhi">Delhi</option>
                    <option value="maharashtra">Maharashtra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">District *</label>
                  <select className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select District</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Court Establishment *</label>
                  <select className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Court</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Case Type *</label>
                  <div className="flex space-x-4 mb-2">
                    <label className="flex text-black items-center">
                      <input type="radio" name="caseCategory" className="mr-2" />
                      <span>Civil</span>
                    </label>
                    <label className="flex text-black items-center">
                                            <input type="radio" name="caseCategory" className="mr-2" />
                      <span>Criminal</span>
                    </label>
                  </div>
                  <select className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Case Type</option>
                    <option value="writ">Writ Petition</option>
                    <option value="civil">Civil Appeal</option>
                    <option value="criminal">Criminal Appeal</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Signing Method *</label>
                <div className="flex space-x-4">
                  <label className="flex items-center text-black">
                    <input type="radio" name="signingMethod" value="aadhar" className="mr-2" />
                    <span>Aadhar e-Sign</span>
                  </label>
                  <label className="flex items-center text-black">
                    <input type="radio" name="signingMethod" value="digital" className="mr-2" />
                    <span>Digital Token</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-black">Petitioner Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">First Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Last Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Gender *</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Age *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter age"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">Address *</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    rows="3"
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <label className="text-sm text-black">Organization Details</label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-black">Respondent Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter respondent name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Designation</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter designation"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">Address</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    rows="3"
                    placeholder="Enter address"
                  />
                </div>
              </div>
              
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Another Respondent
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-black">Case Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Act *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter Act"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Section *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter Section"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">Case Summary</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    rows="4"
                    placeholder="Brief summary of the case"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2 text-black">Subordinate Court Details (if applicable)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Court Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Name of subordinate court"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Case Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Previous case number"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-black">Upload Documents</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">📎</div>
                <p className="text-black mb-4">Drag and drop files here or click to browse</p>
                <p className="text-sm text-black mb-4">Supported format: PDF only (Max size: 25MB)</p>
                <input type="file" multiple accept=".pdf" className="hidden" id="fileUpload" />
                <label
                  htmlFor="fileUpload"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Choose Files
                </label>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-black">Uploaded Documents</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="font-medium text-black">petition.pdf</p>
                        <p className="text-sm text-black">2.5 MB • Hash: abc123...</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-black">Pay Court Fees</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-800">Court Fee Calculation</h4>
                <div className="mt-2 space-y-1 text-sm text-black">
                  <p>Filing Fee: ₹500</p>
                  <p>Process Fee: ₹200</p>
                  <p className="font-semibold">Total Amount: ₹700</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-black">Online Payment</h4>
                  <div className="space-y-2">
                    <label className="flex items-center text-black">
                      <input type="radio" name="paymentMethod" className="mr-2" />
                      <span>Net Banking</span>
                    </label>
                    <label className="flex items-center text-black">
                      <input type="radio" name="paymentMethod" className="mr-2" />
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center text-black">
                      <input type="radio" name="paymentMethod" className="mr-2" />
                      <span>UPI</span>
                    </label>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Pay Now
                  </button>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-black">Upload Receipt</h4>
                  <p className="text-sm text-black mb-3">If you have already paid offline, upload the receipt</p>
                  <input type="file" accept=".pdf,.jpg,.png" className="mb-3" />
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Upload Receipt
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-black">Review & Submit</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold mb-4 text-black">Case Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-black font-medium">E-Filing Number:</span>
                    <span className="text-black">EF/2024/001234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-black">Court:</span>
                    <span className="text-black">Delhi High Court</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-black">Case Type:</span>
                    <span className="text-black">Writ Petition</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-black">Total Fee Paid:</span>
                    <span className="text-black">₹700</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Affirmation Required</h4>
                <p className="text-sm text-black mb-3">
                  You need to digitally sign the affirmation before final submission
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                  Proceed to Affirmation
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-4">
              <button className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50">
                Save as Draft
              </button>
              {step < 7 ? (
                <button
                  onClick={() => setStep(Math.min(7, step + 1))}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Final Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Document Filing Component
  const DocumentFiling = () => {
    const [searchCNR, setSearchCNR] = useState('');
    const [selectedCase, setSelectedCase] = useState(null);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-black">File Miscellaneous Documents</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                CNR Number *
              </label>
              <input
                type="text"
                value={searchCNR}
                onChange={(e) => setSearchCNR(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter CNR Number (e.g., DLHC01-000123-2024)"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">State</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Select State</option>
                  <option value="delhi">Delhi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">District</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Select District</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Court</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Select Court</option>
                </select>
              </div>
            </div>
            
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Search Case
            </button>
          </div>
          
          {searchCNR && (
            <div className="mt-6 border-t pt-6">
              <h3 className="font-semibold mb-4 text-black">Case Found</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-black"><strong>Case Title:</strong> State vs John Doe</p>
                <p className="text-black"><strong>CNR:</strong> DLHC01-000123-2024</p>
                <p className="text-black"><strong>Court:</strong> Delhi High Court</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Document Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                    <option value="">Select Document Type</option>
                    <option value="affidavit">Affidavit</option>
                    <option value="application">Application</option>
                    <option value="reply">Reply</option>
                    <option value="rejoinder">Rejoinder</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Document Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter document title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Upload Document</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input type="file" accept=".pdf" className="hidden" id="docUpload" />
                    <label htmlFor="docUpload" className="cursor-pointer">
                      <div className="text-2xl mb-2">📎</div>
                      <p className="text-black">Click to upload PDF document</p>
                    </label>
                  </div>
                </div>
                
                <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Upload Document
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Deficit Court Fees Component
  const DeficitCourtFees = () => {
    const [deficitCases] = useState([
      { cnr: 'DLHC01-000123-2024', title: 'State vs John Doe', amount: 200 },
      { cnr: 'DLHC01-000124-2024', title: 'ABC vs XYZ Ltd', amount: 500 }
    ]);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Pay Deficit Court Fees</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                CNR Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter CNR Number"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">State</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Select State</option>
                  <option value="delhi">Delhi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">District</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Select District</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Court</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="">Select Court</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-4 text-black">Cases with Deficit Fees</h3>
            <div className="space-y-3">
              {deficitCases.map((case_, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-black">{case_.title}</p>
                    <p className="text-sm text-black">CNR: {case_.cnr}</p>
                    <p className="text-sm text-red-600">Deficit Amount: ₹{case_.amount}</p>
                  </div>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    Pay ₹{case_.amount}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Reports Component
  const Reports = () => {
    const [reportType, setReportType] = useState('court-fees');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Reports</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="court-fees">Court Fees Filing</option>
                <option value="case-status">Case Status</option>
                <option value="documents">Document Filing</option>
                <option value="monthly">Monthly Summary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>
          
          <div className="flex space-x-4 mb-6">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Generate Report
            </button>
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50">
              Export PDF
            </button>
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-black hover:bg-gray-50">
              Export Excel
            </button>
          </div>
          
          {/* Sample Report Table */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Case Details</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Transaction ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3].map((_, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-black">2024-01-{15 + idx}</td>
                    <td className="px-4 py-2 text-sm text-black">EF/2024/00{idx + 1}</td>
                    <td className="px-4 py-2 text-sm text-black">₹{(idx + 1) * 500}</td>
                    <td className="px-4 py-2 text-sm text-black">TXN{1000 + idx}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Paid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  // Help & Support Component
  const HelpSupport = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Manual */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-black flex items-center">
            <span className="text-2xl mr-2">📖</span>
            User Manual
          </h3>
          <div className="space-y-3">
            <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-black">Getting Started Guide</p>
              <p className="text-sm text-black">Learn how to use the e-Filing system</p>
            </a>
            <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-black">Filing Procedures</p>
              <p className="text-sm text-black">Step-by-step filing instructions</p>
            </a>
            <a href="#" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-black">System Requirements</p>
              <p className="text-sm text-black">Hardware & software requirements</p>
            </a>
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-black flex items-center">
            <span className="text-2xl mr-2">🎥</span>
            Video Tutorials
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-12 bg-red-500 rounded flex items-center justify-center text-white">
                  ▶️
                </div>
                <div>
                  <p className="font-medium text-black">How to File a New Case</p>
                  <p className="text-sm text-black">Duration: 15 mins</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-12 bg-red-500 rounded flex items-center justify-center text-white">
                  ▶️
                </div>
                <div>
                  <p className="font-medium text-black">Document Upload Process</p>
                  <p className="text-sm text-black">Duration: 8 mins</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-black flex items-center">
            <span className="text-2xl mr-2">❓</span>
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            <details className="border border-gray-200 rounded-lg">
              <summary className="p-3 cursor-pointer font-medium text-black hover:bg-gray-50">
                What file formats are supported?
              </summary>
              <div className="p-3 border-t border-gray-200 text-sm text-black">
                Only PDF format is supported for document uploads. Maximum file size is 25MB.
              </div>
            </details>
            <details className="border border-gray-200 rounded-lg">
              <summary className="p-3 cursor-pointer font-medium text-black hover:bg-gray-50">
                How to track case status?
              </summary>
              <div className="p-3 border-t border-gray-200 text-sm text-black">
                You can track your case status using the CNR number in the 'My Cases' section.
              </div>
            </details>
            <details className="border border-gray-200 rounded-lg">
              <summary className="p-3 cursor-pointer font-medium text-black hover:bg-gray-50">
                Payment methods available?
              </summary>
              <div className="p-3 border-t border-gray-200 text-sm text-black">
                Net banking, credit/debit cards, and UPI payments are accepted.
              </div>
            </details>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-black flex items-center">
            <span className="text-2xl mr-2">📞</span>
            Contact Support
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">📞</span>
              </div>
              <div>
                <p className="font-medium text-black">Helpline</p>
                <p className="text-sm text-black">+91-11-23072136</p>
                <p className="text-xs text-black">9 AM - 7 PM (Business Days)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">✉️</span>
              </div>
              <div>
                <p className="font-medium text-black">Email Support</p>
                <p className="text-sm text-black">ecommittee@aij.gov.in</p>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start Live Chat
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // OTP Verification Component
  const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    
    const handleOtpChange = (index, value) => {
      if (value.length <= 1) {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Auto-focus next input
        if (value && index < 5) {
          document.getElementById(`otp-${index + 1}`).focus();
        }
      }
    };

    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4"
      >
        <div className="max-w-md w-full">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold mb-2 text-black">OTP Verification</h2>
            <p className="text-black mb-6">
              Enter the 6-digit code sent to your mobile number and email address
            </p>
            
            <div className="flex justify-center space-x-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black"
                />
              ))}
            </div>
            
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all mb-4"
            >
              Verify OTP
            </button>
            
            <p className="text-sm text-black">
              Didn't receive the code? 
              <button className="text-blue-600 hover:text-blue-700 ml-1 font-semibold">
                Resend OTP
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // Main component render logic
  if (!isLoggedIn && !showRegistration && !otpSent) {
    return <LoginScreen />;
  }
  
  if (showRegistration && !otpSent) {
    return <RegistrationScreen />;
  }
  
  if (otpSent && !isLoggedIn) {
    return <OTPVerification />;
  }
  
  if (isLoggedIn) {
    return <Dashboard />;
  }

  return null;
};

export default EFiling;