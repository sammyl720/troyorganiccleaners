insert into public.business_hours(day_of_week,day_name,is_open,open_time,close_time,display_order) values
(0,'Sunday',true,'10:00','16:00',0),
(1,'Monday',true,'08:00','19:00',1),
(2,'Tuesday',true,'08:00','19:00',2),
(3,'Wednesday',true,'08:00','19:00',3),
(4,'Thursday',true,'08:00','19:00',4),
(5,'Friday',true,'08:00','15:30',5),
(6,'Saturday',false,null,null,6)
on conflict(day_of_week) do nothing;
insert into public.banner(id,enabled) values(1,false) on conflict(id) do nothing;
insert into public.service_categories(name,slug,display_order) values ('Dry Cleaning','dry-cleaning',0),('Laundry','laundry',1),('Tailoring','tailoring',2),('Household','household',3),('Specialty','specialty',4) on conflict(slug) do nothing;
-- No prices are published on the existing website. Do not seed the brief's illustrative prices.
