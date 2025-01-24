
const DashboardCard = ({ icon: Icon, title, value, bgColor }) => {
    return (
        <div className={`${bgColor} text-white p-4 rounded-md shadow-lg flex items-center space-x-4 transform transition-transform duration-300 hover:scale-105`}>
            <Icon className="text-4xl" />
            <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        </div>
    );
};

export default DashboardCard;