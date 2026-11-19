<!-- 【說明】上傳檔案：HTML 表單＋PHP 處理。需要 PHP 伺服器，網站上無法執行。 -->
<!DOCTYPE html>
<html lang='zh-TW'>
  <head>
    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>

    <!--jQuery-->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
        
    <!--bootstrap-->
    <!-- 【說明】Bootstrap 5 只用來美化表單。 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
      
    <!-- 【說明】popper.js 1.14 是 Bootstrap 4 用的；上一行的 bootstrap.bundle 已經內含 Bootstrap 5 需要的 Popper，所以這行其實用不到。 -->
    <script src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js' integrity='sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49' crossorigin='anonymous'></script>
        
    
    <style>
      .row{ 
        margin-bottom: 20px;
      }
      a.file{
        display: block;
      }
    </style>
  </head>
  <body>
    <div class='container'>
      <!------------------------------------------------------>
      <div class='row'>
        <h1>File Upload Example</h1>
      </div>
      <!------------------------------------------------------>
      
      <!-- 【說明】上傳檔案一定要 method='post' 和 enctype="multipart/form-data"。沒有寫 action，所以送出到同一個網址（這個檔案自己）。 -->
      <form enctype="multipart/form-data" method='post'>
        <div class="form-group">
          <label for="fileX">Example file input</label>
          <!-- 【說明】name 是 fileX，PHP 端用 $_FILES['fileX'] 取得這個檔案的資訊。 -->
          <input type="file" class="form-control-file" name='fileX'>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>
      </form>
      <?php        
        // 【說明】有上傳檔案時才處理：先用 print_r 顯示 $_FILES 的內容（name、type、tmp_name、error、size）。
        if(count($_FILES)){          
          echo "\$_FILES:<pre class='alert alert-dark'>".print_R($_FILES,1)."</pre>";
          
          // 【說明】在這個檔案所在的資料夾建立 files 子資料夾；已經存在時會有警告，用 @ 隱藏。
          @mkdir(__DIR__."/files"); //create a folder named files, @ is used to hide warning if occured . 
          // __DIR__ , Predefined Constants, the directory of the file.  Absolute path 
                  
          //move file to a specific folder
          // 【說明】把暫存檔搬到 files/ 並用原檔名存檔。同名檔案會被覆蓋。
          //   安全提醒：這樣任何人都能上傳 .php 檔再從網址執行，只能在自己電腦上練習。
          move_uploaded_file($_FILES['fileX']['tmp_name'],__DIR__."/files/{$_FILES['fileX']['name']}");  //tmp_name is assigend while uploading a file
        }
        
        //show files in the files folder
        if(file_exists(__DIR__."/files")){
          // 【說明】scandir 列出資料夾裡的檔案，結果包含代表目前與上一層資料夾的 . 和 ..，所以要排除。每個檔案顯示成可下載的連結。
          foreach(scandir(__DIR__."/files") as $filename){    // include . and ..
            if($filename!="." && $filename!=".."){
              echo "<a class='file alert alert-success' href='files/{$filename}'>{$filename}</a>";
            }
          }          
        }        
      ?>
    </div>
  </body>
</html>