<!DOCTYPE html>
<html lang="zh-HK">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insurance Home Page</title>
    <link rel="stylesheet" href="../navbar/NavBar.css">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Aldrich&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="../auth.js"></script>
</head>

<body>

    <?php
    session_start();

    // 檢查登入狀態
    $isLoggedIn = isset($_SESSION['userid']);
    $userData = null;

    if ($isLoggedIn) {
        $userData = [
            'userid' => $_SESSION['userid'],
            'name' => $_SESSION['name'],
            'email' => $_SESSION['email']
        ];
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // 連接到數據庫
        $servername = "localhost"; // 數據庫伺服器
        $username = "root"; // 數據庫用戶名
        $password = ""; // 數據庫密碼
        $dbname = "ins"; // 數據庫名稱
    
        // 創建連接
        $conn = new mysqli($servername, $username, $password, $dbname);

        // 檢查連接
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // 獲取表單數據
        $vehicleYear = $_POST['vehicleYear'];
        $cc = $_POST['cc'];
        $vehicleModel = $_POST['vehicleModel'];
        $driverAge = $_POST['driverAge'];
        $driverOccupation = $_POST['driverOccupation'];
        $name = $_POST['name'];
        $phone = $_POST['phone'];
        $email = $_POST['email'];

        // 插入數據
        $sql = "INSERT INTO insurance_requests (vehicle_year, cc, vehicle_model, driver_age, driver_occupation, name, phone, email)
            VALUES ('$vehicleYear', '$cc', '$vehicleModel', '$driverAge', '$driverOccupation', '$name', '$phone', '$email')";

        if ($conn->query($sql) === TRUE) {
            // 提交成功後顯示感謝信息
            echo "<script>alert('Thank you! Your request has been submitted.');</script>";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }

        // 關閉連接
        $conn->close();
    }
    ?>

    <nav>
        <div class="wrapper">
            <div class="logo"><a href="../homePage/homePage.html">Legend Motor</a></div>
            <input type="radio" name="slider" id="menu-btn">
            <input type="radio" name="slider" id="close-btn">
            <ul class="nav-links">
                <label for="close-btn" class="btn close-btn"><i class="fas fa-times"></i></label>
                <li><a href="../homePage/homePage.html">Home</a></li>
                <li><a href="#">About</a></li>
                <li>
                    <a href="../PurchasePage/PurchasePage.html" class="desktop-item">Vehicles</a>
                    <input type="checkbox" id="Vehicles">
                    <label for="showDrop" class="mobile-item">Vehicles</label>
                    <ul class="drop-menu">
                        <li><a href="../PurchasePage/PurchasePage.html">Online Purchase</a></li>
                        <li><a href="#">Vehicle Components</a></li>
                    </ul>
                </li>
                <li>
                    <a href="#" class="desktop-item">Insurance Services</a>
                    <input type="checkbox" id="Insurance Services">
                    <label for="showMega" class="mobile-item">Insurance Services</label>
                    <div class="mega-box">
                        <div class="content">
                            <div class="row">
                                <img src="./src/img4.png" alt="">
                            </div>
                            <div class="row">
                                <header>Insurance Quotation Request</header>
                                <ul class="mega-links">
                                    <li><a href="../InsuranceHomePage/InsuranceHomePage.php">Insurance Product</a></li>
                                    <li><a href="#">Insurance FAQs</a></li>

                                </ul>
                            </div>
                            <div class="row">

                            </div>
                        </div>
                    </div>
                </li>
                <li><a href="#">Feedback</a></li>
                <!-- Add Shopping Cart Icon -->
                <li class="desktop-item">
                    <a href="#">
                        <i class="fas fa-shopping-cart"></i>
                    </a>
                    <input type="checkbox" id="showMega">
                    <label for="showMega" class="showMegaLabel"></label>
                    <div class="mega-box">
                        <div class="content" id="cartItemsContainer">
                            <!-- 顧客選擇的汽車將會出現在這裡 -->
                        </div>
                        <button onclick="togglePopup()" class="checkout-btn">Checkout</button> <!-- Checkout 按鈕 -->
                    </div>
                </li>

                <!-- Add User Icon -->
                <li class="nav-icon" id="userIconContainer">
                    <a id="userIcon">
                        <i class="fas fa-user"></i>
                    </a>
                </li>
            </ul>
            <label for="menu-btn" class="btn menu-btn"><i class="fas fa-bars"></i></label>
        </div>
    </nav>

    <div class="container">
        <div class="hero" id="heroSection">
            <h1>Welcome to Legend Motor</h1>
            <p>Explore the best insurance plans for your motorcycle and enjoy peace of mind.</p>
            <button class="cta-button" id="applyButton">Apply for Insurance Now</button>
        </div>

        <div class="form-container hidden" id="insuranceForm">
            <div id="vehicleInfoForm" class="form-section">
                <h3>Vehicle Information</h3>
                <form id="vehicleForm" method="POST" action="index.php">
                    <div class="form-group">
                        <label for="vehicleYear">Vehicle Year</label>
                        <input type="text" name="vehicleYear" id="vehicleYear" required>
                    </div>
                    <div class="form-group">
                        <label for="cc">CC</label>
                        <input type="text" name="cc" id="cc" required>
                    </div>
                    <div class="form-group">
                        <label for="vehicleModel">Vehicle Model</label>
                        <input type="text" name="vehicleModel" id="vehicleModel" required>
                    </div>
                    <button type="submit">Next</button>
                </form>
            </div>

            <div id="driverInfoForm" class="form-section hidden">
                <h3>Driver Information</h3>
                <form id="driverForm">
                    <div class="form-group">
                        <label for="driverAge">Driver Age</label>
                        <select name="driverAge" id="driverAge" required>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="driverOccupation">Driver Occupation</label>
                        <input type="text" name="driverOccupation" id="driverOccupation" required>
                    </div>
                    <button type="submit" id="nextToContactInfo">Next</button>
                </form>
            </div>

            <div id="contactInfoForm" class="form-section hidden">
                <h3>Contact Information</h3>
                <form id="contactForm">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" name="name" id="name" required />
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="text" name="phone" id="phone" required />
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" name="email" id="email" required />
                        <input type="hidden" id="customerId" name="customerId" value="12345">
                    </div>
                    <button type="submit" id="submitContactInfo">Submit</button>
                </form>
            </div>

            <div id="confirmationMessage" class="form-section hidden">
                <h3>Thank you!</h3>
                <p>We have received your quotation request, and our customer service representative will contact you as
                    soon as possible.</p>
            </div>
        </div>
    </div>

    <footer>
        <p>Contact Information | Social Media Links | Privacy Policy | Terms of Use</p>
    </footer>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            initAuthCheck();

            // 如果需要立即獲取用戶狀態
            checkLoginStatus().then(result => {
                if (!result.isLoggedIn) {
                    // 處理未登入情況
                    console.log('User not logged in');
                    // 可以在這裡添加相應的處理邏輯
                } else {
                    // 處理已登入情況
                    console.log('User logged in:', result.userData);
                    // 可以在這裡添加相應的處理邏輯
                }
            });
        });
    </script>
    <script src="script.js"></script>
</body>

</html>