import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import { api_laravel, api_laravel_local } from "@/src/api_new";
import { MyAutocomplite, MyTextInput } from "@/ui/Forms";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ModalPost } from "@/components/vk_post/ModalPost";
import dayjs from "dayjs";
import BarChartIcon from "@mui/icons-material/BarChart";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import IconButton from "@mui/material/IconButton";
import dynamic from "next/dynamic";
import Typography from "@mui/material/Typography";
import VKAuthDialog from "@/components/vk_post/VKAuthDialog";
import MyAlert from "@/ui/MyAlert";
import CloseIcon from "@mui/icons-material/Close";

const ModalGraph = dynamic(() => import("@/components/vk_post/ModalGraph"), {
  ssr: false,
  loading: () => <div style={{ padding: 20 }}>📊 Загрузка...</div>,
});

export const GuardIcon = ({ color = "#FFFFFF" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-shield-check h-3.5 w-3.5"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
      <path d="m9 12 2 2 4-4"></path>
    </svg>
  );
};

export const ReloadIcon = ({ color = "#FFFFFF" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-refresh-cw mr-1.5 h-3.5 w-3.5"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
      <path d="M8 16H3v5"></path>
    </svg>
  );
};

export const TokenIcon = ({ color = "#000000" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-refresh-cw mr-1.5 h-3.5 w-3.5"
    >
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
      <circle
        cx="16.5"
        cy="7.5"
        r=".5"
        fill="currentColor"
      ></circle>
    </svg>
  );
};

function FeedbackPage() {
  const [isLoad, setIsLoad] = useState(false);
  const [module, setModule] = useState({});
  const [group, setGroup] = useState({});
  const [groups, setGroups] = useState([]);

  // Состояние для постов и пагинации
  const [posts, setPosts] = useState({ items: [], total: 0 });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    offset: 0,
    totalPages: 0,
  });

  const [postChoose, setPostChoose] = useState({});
  const [active, setActive] = useState({});
  const [graphData, setGraphData] = useState([]);
  const [openRight, setOpenRight] = useState(false);
  const [openGraph, setOpenGraph] = useState(false);
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [token, setToken] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [errStatus, setErrStatus] = useState(false);
  const [errText, setErrText] = useState("");
  const [search, setSearch] = useState("");
  const [valid, setValid] = useState(true);
  const authUrl =
    "https://oauth.vk.com/authorize?client_id=54463410&display=popup&redirect_uri=https://oauth.vk.com/blank.html&scope=offline,wall,groups,photos&response_type=token&v=5.199";

  const handleSaveToken = (newToken) => {
    setToken(newToken);
    getData("save_token", { newToken, group_id: group?.vk_group_id }).then((data) => {
      setOpenDialog(false);
      getData("check_valid_token", { vk_group_id: group?.vk_group_id }).then((data) => {
        setValid(data.valid);
      });
    });
  };

  const fetchPosts = async (page = 1, limit = 10) => {
    if (!group?.id) return;

    setIsLoad(true);
    const offset = (page - 1) * limit;

    try {
      const data = await getData("get_info_group", {
        vk_group_id: group.vk_group_id,
        count: limit,
        offset: offset,
        search,
      });
      setPosts({
        items: data.posts?.items || [],
        total: data.posts?.count || 0,
      });

      // Обновляем пагинацию
      setPagination((prev) => ({
        ...prev,
        page,
        limit,
        offset,
        totalPages: Math.ceil((data.posts?.count || 0) / limit),
      }));
    } catch (error) {
      console.error("Ошибка загрузки постов:", error);
    } finally {
      setIsLoad(false);
    }
  };

  const getPost = (item) => {
    getData("get_post", { ...item, vk_group_id: group?.vk_group_id }).then((data2) => {
      const data = data2.post[0];
      setPostChoose({
        ...item,
        id: data.post_id,
        vk_group_id: group.vk_group_id,
        date: dayjs.unix(item.date).format("DD.MM.YYYY"),
        reach: [
          { label: "Всего", value: data.reach_total },
          { label: "Подписчики", value: data.reach_subscribers },
          { label: "Виральный", value: data.reach_viral },
          { label: "Рекламный", value: data.reach_ads },
        ],
        actions: [
          { label: "Ссылки", value: data.links },
          { label: "В группу", value: data.to_group },
          { label: "Вступили", value: data.join_group },
          { label: "Скрыли", value: data.hide },
          { label: "Жалобы", value: data.report },
          { label: "Отписки", value: data.unsubscribe },
        ],
        updated: dayjs.unix(item.date).format("DD.MM.YYYY, HH:mm:ss"),
      });
      setOpenRight(true);
    });
  };

  const getPostGraph = (item) => {
    getData("get_post_graph", { ...item, vk_group_id: group?.vk_group_id }).then((data) => {
      setPostChoose(item);
      setGraphData(data.posts);
      setOpenGraph(true);
    });
  };

  // Загрузка модулей и групп при монтировании
  useEffect(() => {
    getData("get_all").then((data) => {
      document.title = data.module_info.name;
      setModule(data.module_info);
      setGroups(data.groups);
    });
  }, []);

  // Загрузка постов при изменении группы
  useEffect(() => {
    if (group?.id) {
      fetchPosts(1, 10);
      getData("check_valid_token", { vk_group_id: group?.vk_group_id }).then((data) => {
        setValid(data.valid);
      });
    }
  }, [group]);

  useEffect(() => {
    if (search && group?.id) {
      const timeoutId = setTimeout(() => {
        fetchPosts(1, 10);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [search]);

  // Обработчик изменения страницы
  const handlePageChange = (event, newPage) => {
    fetchPosts(newPage, pagination.limit);
  };

  // Обработчик изменения количества записей на странице
  const handleLimitChange = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    fetchPosts(1, newLimit);
  };

  const getData = async (method, data = {}) => {
    setIsLoad(true);
    try {
      const result = await api_laravel("vk_post", method, data);
      if (result?.data?.text) {
        setErrStatus(result.data?.st);
        setErrText(result.data?.text);
        setOpenAlert(true);
      }

      return result.data;
    } finally {
      setIsLoad(false);
    }
  };

  // Форматирование диапазона записей для отображения
  const getRangeText = () => {
    if (posts.total === 0) return "0 записей";
    const start = pagination.offset + 1;
    const end = Math.min(pagination.offset + pagination.limit, posts.total);
    return `${start}–${end} из ${posts.total}`;
  };

  return (
    <Grid
      container
      spacing={3}
      className="container_first_child"
      size={{ xs: 12, sm: 12 }}
      sx={{ mb: 3 }}
    >
      <Backdrop
        style={{ zIndex: 99 }}
        open={isLoad}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <VKAuthDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveToken}
        authUrl={authUrl}
      />

      {/* Модальные окна */}
      {openRight && (
        <ModalPost
          postData={postChoose}
          openGraph={getPostGraph}
          refreshPost={getPost}
          onClose={() => setOpenRight(false)}
          open={openRight}
        />
      )}
      {openGraph && (
        <ModalGraph
          data={graphData}
          onClose={() => setOpenGraph(false)}
          open={openGraph}
          postId={postChoose.id}
        />
      )}
      <MyAlert
        isOpen={openAlert}
        onClose={() => setOpenAlert(false)}
        status={errStatus}
        text={errText}
      />

      {/* Заголовок и управление */}
      <Grid size={{ xs: 12, sm: 5 }}>
        <h1>{module.name}</h1>
      </Grid>
      <Grid
        size={{ xs: 12, sm: 7 }}
        sx={{ display: "flex", justifyContent: "flex-end" }}
      >
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <MyAutocomplite
            label="Группы"
            data={groups}
            style={{ minWidth: "288px" }}
            multiple={false}
            value={group}
            func={(event, data) => setGroup(data)}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: valid ? "#1ba74e" : "red",
              color: "white",
              padding: "4px 12px",
              borderRadius: "16px",
            }}
          >
            {valid ? (
              <>
                <GuardIcon /> Токен ОК
              </>
            ) : (
              <>
                <CloseIcon /> Токен ERROR
              </>
            )}
          </div>
          <Button
            sx={{
              backgroundColor: "#186adc",
              color: "white",
              borderRadius: "12px",
              padding: "8px",
            }}
            onClick={() => fetchPosts(pagination.page, pagination.limit)}
          >
            <ReloadIcon style={{ marginRight: "6px" }} />{" "}
            <span style={{ marginLeft: "8px" }}>Обновить данные</span>
          </Button>
          <Button
            sx={{
              backgroundColor: "#e8eaed",
              color: "black",
              borderRadius: "12px",
              padding: "8px",
            }}
            onClick={() => setOpenDialog(true)}
          >
            <TokenIcon /> <span style={{ marginLeft: "8px" }}>Права / Токен</span>
          </Button>
        </div>
      </Grid>

      {/* Таблица с постами */}
      <Grid size={{ xs: 12, sm: 12 }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <div>
            <MyTextInput
              label="Поиск по тексту или ID"
              value={search}
              func={(e) => setSearch(e.target.value)}
              style={{ minWidth: "288px" }}
            />
          </div>
          {/* Выбор количества записей */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.875rem", color: "#666" }}>Показать:</span>
            <select
              value={pagination.limit}
              onChange={handleLimitChange}
              style={{
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "1.25rem",
                cursor: "pointer",
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <Table
          sx={{ marginTop: "24px" }}
          stickyHeader
        >
          <TableHead>
            <TableRow>
              <TableCell
                style={{
                  backgroundColor: "#f2f2f2",
                  borderRadius: "12px 0 0 0",
                  borderBottom: "1px solid #e5e5e5",
                }}
              >
                #
              </TableCell>
              <TableCell style={{ backgroundColor: "#f2f2f2", borderBottom: "1px solid #e5e5e5" }}>
                Дата
              </TableCell>
              <TableCell style={{ backgroundColor: "#f2f2f2", borderBottom: "1px solid #e5e5e5" }}>
                Post ID
              </TableCell>
              <TableCell style={{ backgroundColor: "#f2f2f2", borderBottom: "1px solid #e5e5e5" }}>
                Текст
              </TableCell>
              <TableCell style={{ backgroundColor: "#f2f2f2", borderBottom: "1px solid #e5e5e5" }}>
                Действия
              </TableCell>
              <TableCell
                style={{
                  backgroundColor: "#f2f2f2",
                  borderRadius: "0 12px 0 0",
                  borderBottom: "1px solid #e5e5e5",
                }}
              ></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.items?.length > 0 ? (
              posts.items.map((it, k) => (
                <TableRow
                  hover
                  key={`${it.id}-${k}`}
                >
                  <TableCell sx={{ border: "1px solid #e5e5e5" }}>
                    {pagination.offset + k + 1}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #e5e5e5" }}>
                    {new Date(it.date * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell
                    onClick={() => getPost(it)}
                    sx={{
                      color: "#186adc",
                      cursor: "pointer",
                      border: "1px solid #e5e5e5",
                      "&:hover": { color: "blue", textDecoration: "underline" },
                    }}
                  >
                    {it.post_id}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      border: "1px solid #e5e5e5",
                      maxWidth: "400px",
                    }}
                  >
                    {it.text}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #e5e5e5" }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          margin: "4px",
                          border: "1px solid #E5E5E5",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          backgroundColor: "#f2f2f2",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span>👍</span>
                        {it.likes}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          margin: "4px",
                          border: "1px solid #E5E5E5",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          backgroundColor: "#f2f2f2",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span>👎</span>
                        {it.dislikes}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          margin: "4px",
                          border: "1px solid #E5E5E5",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          backgroundColor: "#f2f2f2",
                          fontSize: "0.875rem",
                        }}
                      >
                        🔗 {it.reposts}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          margin: "4px",
                          border: "1px solid #E5E5E5",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          backgroundColor: "#f2f2f2",
                          fontSize: "0.875rem",
                        }}
                      >
                        👁 {it.views}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #e5e5e5" }}>
                    <div>
                      <IconButton
                        onClick={() => getPostGraph(it)}
                        sx={{
                          border: "1px solid #E0E0E0",
                          width: 40,
                          height: 40,
                          mr: 1,
                          color: "text.primary",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                        }}
                      >
                        <BarChartIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() =>
                          window.open(
                            `https://vk.com/wall-${group.vk_group_id}_${it.post_id}`,
                            "_blank",
                          )
                        }
                        sx={{
                          border: "1px solid #E0E0E0",
                          width: 40,
                          height: 40,
                          color: "text.primary",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                        }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 4, color: "#666" }}
                >
                  {isLoad ? "Загрузка..." : "Нет данных для отображения"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Пагинация */}
        {pagination.totalPages > 1 && (
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid #e5e5e5",
              borderRadius: "0 0 12px 12px",
              backgroundColor: "#f2f2f2",
            }}
          >
            <Grid
              item
              xs={12}
              sm={6}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {getRangeText()}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="medium"
                showFirstButton
                showLastButton
                renderItem={(item) => (
                  <PaginationItem
                    components={{
                      previous: KeyboardArrowDownIcon,
                      next: KeyboardArrowDownIcon,
                    }}
                    {...item}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "#186adc",
                        color: "white",
                        "&:hover": { backgroundColor: "#155db5" },
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}

export default function FeedBack() {
  return <FeedbackPage />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT");

  return { props: {} };
}
