
// ======== TEAMWORK ========

board -> list -> task

--- quy trình thao tác tạo Project cá nhân ---

- chủ project
  -> tạo project (board)
    -> tạo list quản lý từng task
      -> tạo task cần làm

--- quy trình thêm member vào project ---

- chủ project
  -> tạo project (board)
    -> tạo list quản lý từng task
      -> tạo task cần làm
        -> muốn thêm member vào làm chung project
          -> vào trực tiếp task, search tên member cần thêm

--- quy trình THÊM or XÓA member vào task của project ---

-> user đã được thêm vào project
  -> tìm kiếm user cần assign vào task
    -> chọn user
      [x] add userId (member) vào field 'member' của table 'cards'
      [x] task (cardId) sẽ được thêm vào field 'failed' của table 'users' (chưa làm or làm chưa xong)
        (hoặc case là là chỉ assign member vào task chưa được làm)

-> chọn user trong task để xóa
  [x] xóa userId trong field 'member' của table 'cards'
  [x] xóa cardId trong field 'completed' hoặc 'failed' của table 'users'
    + check xem cardId nằm trong field nào của table 'users'
  [x] xóa userId trong field 'member' của table 'teamworks'


- table 'users'
  + field 'completed' chứa các task được assign. Trong task đó chứa các thông tin (boardId, cardId)
  + field 'failed' cũng tương tự như thế.





// ======== REPORT ========

board chứa tổng các task (title, status)

[x] table 'completedTodo' dùng để thống kê cho 1 project (Board) dựa vào boardId và userId (owner)
[x] khi add member vào project và task thì cũng sẽ add vào 'teamtodo' gồm các field:
      + owner,
      + boardId,
      + member: [{ id, name, completed: [], failed: [] }]
[x] khi 1 project (board) được tạo ra thì sẽ tạo luôn 'teamtodo' kèm theo để quản lý việc teamwork (nếu có)

[x] UPDATE cardId theo status của task:
  - update status 'completed' trong table 'cards'                                                            [R]
  - update cardId theo status ứng với field 'cardCompleted' hoặc 'cardFailed' trong table 'completedTodos'    [R]
  - update cardId theo status ứng với field 'completed' hoặc 'failed' trong table 'teamworks'                 [R]

[x] REMOVE PROJECT (board) thì sẽ:
  + xóa hẳn record trong table 'teamworks' dựa vào boardId.   [R]
  + xóa boardId tại các User có tham gia                      [R]
  + xóa boardId tại các List thuộc project                    [R]
  + xóa boardId tại các task thuộc project                    [R]
  + xóa boardId tại CompletedTodo                             [R]

[x] REMOVE TASK (card) thì sẽ:
  - xóa cardId tại table 'teamworks'            [R]
  - xóa cardId tại table 'CompletedTodo'        [R]
  - xóa cardId tại table 'Lists' chứa task đó   [R]
  - xóa cardId tại table 'Comments' chứa task   [R]